import { prisma } from "@/prisma/prismaclient";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  const bills = await prisma.bill.findMany({
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' }
    ]
  });
  return NextResponse.json(bills);
}

export async function POST(req: NextRequest) {
  const { name, category, dueDate, amount } = await req.json();
  const bill = await prisma.bill.create({ 
    data: { 
      name,
      category: category || "Other",
      dueDate: dueDate ? new Date(dueDate) : null,
      amount: amount ? parseFloat(amount) : null
    }
  });
  return NextResponse.json(bill);
}

export async function PATCH(req: NextRequest) {
  const { id, markAsPaid, category, dueDate, amount, name } = await req.json();
  
  if (markAsPaid) {
    // Get the current bill
    const bill = await prisma.bill.findUnique({ 
      where: { id }
    });
    
    if (bill && bill.amount) {
      // Create a payment record
      await prisma.$executeRaw`
        INSERT INTO Payment (billId, amount, paidAt) 
        VALUES (${id}, ${bill.amount}, ${new Date().toISOString()})
      `;
      
      // If there's a due date, advance it by 30 days
      if (bill.dueDate) {
        const newDueDate = new Date(bill.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 30);
        
        await prisma.bill.update({
          where: { id },
          data: { dueDate: newDueDate }
        });
      }
    }
    
    // Return the updated bill
    const updatedBill = await prisma.bill.findUnique({
      where: { id }
    });
    return NextResponse.json(updatedBill);
  } else {
    // Regular field updates
    const updateData: any = {};
    if (category !== undefined) {
      updateData.category = category;
    }
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (amount !== undefined) {
      updateData.amount = amount ? parseFloat(amount) : null;
    }
    if (name !== undefined) {
      updateData.name = name;
    }
    
    const bill = await prisma.bill.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json(bill);
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.bill.delete({ where: { id } });
  return NextResponse.json({ success: true });
}