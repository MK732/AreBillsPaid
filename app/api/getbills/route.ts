import { prisma } from "@/prisma/prismaclient";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  const bills = await prisma.bill.findMany();
  return NextResponse.json(bills);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const bill = await prisma.bill.create({ data: { name } });
  return NextResponse.json(bill);
}

export async function PATCH(req: NextRequest) {
  const { id, paid } = await req.json();
  const bill = await prisma.bill.update({
    where: { id },
    data: { paidAt: paid ? new Date() : null },
  });
  return NextResponse.json(bill);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.bill.delete({ where: { id } });
  return NextResponse.json({ success: true });
}