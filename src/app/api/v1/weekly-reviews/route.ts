import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const items = await prisma.weeklyReview.findMany({ orderBy: { weekStart: "desc" } })
    return NextResponse.json({ items })
  } catch (e) { console.error("weekly-reviews error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.weeklyReview.upsert({
      where: { weekStart: new Date(body.weekStart) },
      update: body,
      create: body,
    })
    return NextResponse.json(item)
  } catch (e) { console.error("weekly-reviews error:", e); return NextResponse.json({ error: "Failed to create" }, { status: 500 }) }
}
