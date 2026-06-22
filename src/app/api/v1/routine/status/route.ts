import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { searchParams } = new URL(req.url)
    const dayOfWeek = parseInt(searchParams.get("dayOfWeek") ?? String(new Date().getDay()))
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const slots = await prisma.routineSlot.findMany({
      where: { isActive: true, OR: [{ dayOfWeek }, { dayOfWeek: null }] },
      orderBy: { sortOrder: "asc" },
    })
    const logs = await prisma.routineLog.findMany({
      where: { date: { gte: today } },
      select: { slotId: true, completed: true, durationActual: true },
    })
    const logMap = new Map(logs.map((l) => [l.slotId, l]))
    const doneCount = logs.filter((l) => l.completed).length
    return NextResponse.json({ data: { totalSlots: slots.length, doneCount, pendingCount: slots.length - doneCount } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
