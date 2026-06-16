import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const where = category ? { category } : {}
    const rows = await prisma.quickReply.findMany({ where })
    return NextResponse.json(rows)
  } catch (e) {
    console.error("templates error:", e)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await prisma.quickReply.create({ data: body })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error("templates error:", e)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }
    await prisma.quickReply.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("templates error:", e)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}
