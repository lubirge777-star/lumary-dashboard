import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const rows = await prisma.servicePricing.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(rows)
  } catch (e) {
    console.error("services pricing error:", e)
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await prisma.servicePricing.create({ data: body })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error("services pricing error:", e)
    return NextResponse.json({ error: "Failed to create pricing" }, { status: 500 })
  }
}
