import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const rows = await prisma.wedgeLog.findMany({
      orderBy: { clientCount: "desc" },
    })
    return NextResponse.json(rows)
  } catch (e) {
    console.error("wedge error:", e)
    return NextResponse.json({ error: "Failed to fetch wedge logs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await prisma.wedgeLog.create({ data: body })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error("wedge error:", e)
    return NextResponse.json({ error: "Failed to create wedge log" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }
    const body = await request.json()
    const updated = await prisma.wedgeLog.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error("wedge error:", e)
    return NextResponse.json({ error: "Failed to update wedge log" }, { status: 500 })
  }
}
