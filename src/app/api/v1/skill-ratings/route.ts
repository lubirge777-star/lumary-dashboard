import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const items = await prisma.skillRating.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json({ items })
  } catch (e) { console.error("skill-ratings error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.skillRating.upsert({
      where: { name: body.name },
      update: { rating: body.rating, category: body.category },
      create: body,
    })
    return NextResponse.json(item)
  } catch (e) { console.error("skill-ratings error:", e); return NextResponse.json({ error: "Failed to save" }, { status: 500 }) }
}
