import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const items = await prisma.journalEntry.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    return NextResponse.json({ items })
  } catch (e) { console.error("journal-entries error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.journalEntry.create({ data: body })
    return NextResponse.json(item)
  } catch (e) { console.error("journal-entries error:", e); return NextResponse.json({ error: "Failed to create" }, { status: 500 }) }
}
