import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { searchParams } = new URL(req.url)
    const dayOfWeek = searchParams.get("dayOfWeek")
    const where: any = { isActive: true }
    if (dayOfWeek !== null) {
      where.OR = [{ dayOfWeek: parseInt(dayOfWeek) }, { dayOfWeek: null }]
    }
    const slots = await prisma.routineSlot.findMany({ where, orderBy: { sortOrder: "asc" } })
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const logs = await prisma.routineLog.findMany({
      where: { date: { gte: today } },
      select: { slotId: true, completed: true, durationActual: true },
    })
    const logMap = new Map(logs.map((l) => [l.slotId, l]))
    const data = slots.map((s) => ({
      id: s.id, time: s.time, label: s.label, duration: s.duration,
      completed: logMap.get(s.id)?.completed ?? false,
      actualMinutes: logMap.get(s.id)?.durationActual ?? null,
    }))
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const slot = await prisma.routineSlot.create({
      data: {
        time: body.time, label: body.label, duration: body.duration,
        dayOfWeek: body.dayOfWeek ?? null, sortOrder: body.sortOrder ?? 0,
      },
    })
    return NextResponse.json({ data: slot }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
