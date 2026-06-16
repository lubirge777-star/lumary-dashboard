import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const items = await prisma.book.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ items })
  } catch (e) { console.error("books error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.book.create({ data: body })
    return NextResponse.json(item)
  } catch (e) { console.error("books error:", e); return NextResponse.json({ error: "Failed to create" }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
    const body = await req.json()
    const item = await prisma.book.update({ where: { id }, data: body })
    return NextResponse.json(item)
  } catch (e) { console.error("books error:", e); return NextResponse.json({ error: "Failed to update" }, { status: 500 }) }
}
