import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const items = await prisma.movie.findMany({ orderBy: [{ saga: "asc" }, { year: "asc" }] })
    return NextResponse.json({ items })
  } catch (e) { console.error("movies error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const item = await prisma.movie.upsert({
      where: { key: body.key },
      update: { watched: body.watched, withMary: body.withMary, rewatch: body.rewatch },
      create: body,
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e) { console.error("movies error:", e); return NextResponse.json({ error: "Failed to save" }, { status: 500 }) }
}
