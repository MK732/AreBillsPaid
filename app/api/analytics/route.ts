import { prisma } from "@/prisma/prismaclient";
import { NextResponse } from "next/server";

export async function GET() {
  // Get all bills
  const bills = await prisma.bill.findMany();
  
  // Get all payments
  const payments = await prisma.$queryRaw`SELECT * FROM Payment` as any[];
  
  // Calculate basic totals
  const totalBills = bills.length;
  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalDue = bills
    .filter(bill => bill.amount)
    .reduce((sum, bill) => sum + bill.amount!, 0);
  
  // Overdue bills (bills with due dates in the past)
  const overdueBills = bills.filter(bill => 
    bill.dueDate && 
    new Date(bill.dueDate) < new Date()
  );
  
  // Spending by category (from payments)
  const spendingByCategory: Record<string, number> = {};
  for (const payment of payments) {
    const bill = bills.find(b => b.id === payment.billId);
    if (bill) {
      const category = bill.category || 'Other';
      spendingByCategory[category] = (spendingByCategory[category] || 0) + payment.amount;
    }
  }
  
  // Simple monthly spending (last 6 months)
  const monthlySpending = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    const monthlyTotal = payments
      .filter(payment => {
        const paymentDate = new Date(payment.paidAt);
        return paymentDate >= monthStart && paymentDate < monthEnd;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    monthlySpending.push({
      month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
      amount: monthlyTotal
    });
  }
  
  return NextResponse.json({
    summary: {
      totalBills,
      paidBills: payments.length,
      unpaidBills: totalBills,
      totalSpent,
      totalDue,
      billsPaidThisMonth: 0, // Will calculate properly later
      billsDueThisMonth: 0,  // Will calculate properly later
      overdueBills: overdueBills.length
    },
    spendingByCategory,
    monthlySpending,
    upcomingBills: bills.filter(bill => bill.dueDate).slice(0, 5),
    overdueBills: overdueBills.slice(0, 5)
  });
} 