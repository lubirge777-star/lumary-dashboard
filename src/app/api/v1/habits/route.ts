import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const HABIT_DEFAULTS = [
  "Fajr on time", "Quran 1 page", "Exercise / walk", "Arabic 30 min",
  "Code 1.5 hrs", "AI tool 10 min", "Reading 20 min", "Connect with Mary",
  "Journal entry", "Sleep by 22:00",
]

export async function GET() {
  try {
    let items = await prisma.habit.findMany({ orderBy: { sortOrder: "asc" }, include: { logs: { take: 7, orderBy: { date: "desc" } } } })
    if (items.length === 0) {
      for (let i = 0; i < HABIT_DEFAULTS.length; i++) {
        const existing = await prisma.habit.findFirst({ where: { name: HABIT_DEFAULTS[i] } })
        if (!existing) {
          await prisma.habit.create({ data: { name: HABIT_DEFAULTS[i], sortOrder: i } })
        }
      }
      items = await prisma.habit.findMany({ orderBy: { sortOrder: "asc" }, include: { logs: { take: 7, orderBy: { date: "desc" } } } })
    }
    return NextResponse.json({ items })
  } catch (e) { console.error("habits error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.habit.create({ data: body })
    return NextResponse.json(item)
  } catch (e) { console.error("habits error:", e); return NextResponse.json({ error: "Failed to create" }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
    const body = await req.json()
    const item = await prisma.habit.update({ where: { id }, data: body })
    return NextResponse.json(item)
  } catch (e) { console.error("habits error:", e); return NextResponse.json({ error: "Failed to update" }, { status: 500 }) }
}
