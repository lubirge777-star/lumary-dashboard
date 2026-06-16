import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const items = await prisma.movie.findMany({ orderBy: [{ saga: "asc" }, { year: "asc" }] })
    return NextResponse.json({ items })
  } catch (e) { console.error("movies error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.movie.upsert({
      where: { key: body.key },
      update: { watched: body.watched, withMary: body.withMary, rewatch: body.rewatch },
      create: body,
    })
    return NextResponse.json(item)
  } catch (e) { console.error("movies error:", e); return NextResponse.json({ error: "Failed to save" }, { status: 500 }) }
}
