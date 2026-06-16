import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const items = await prisma.habitLog.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      include: { habit: true },
    })
    return NextResponse.json({ items })
  } catch (e) { console.error("habit-logs error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const item = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: body.habitId, date: today } },
      update: { completed: body.completed ?? true },
      create: { habitId: body.habitId, date: today, completed: body.completed ?? true },
    })
    return NextResponse.json(item)
  } catch (e) { console.error("habit-logs error:", e); return NextResponse.json({ error: "Failed to log" }, { status: 500 }) }
}
