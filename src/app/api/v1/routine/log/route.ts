import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const existing = await prisma.routineLog.findUnique({
      where: { slotId_date: { slotId: body.slotId, date: today } },
    })
    if (existing) {
      const log = await prisma.routineLog.update({
        where: { id: existing.id },
        data: {
          completed: body.completed ?? existing.completed,
          durationActual: body.durationActual ?? existing.durationActual,
          notes: body.notes ?? existing.notes,
        },
      })
      return NextResponse.json({ data: log })
    }
    const log = await prisma.routineLog.create({
      data: {
        slotId: body.slotId, date: today,
        completed: body.completed ?? true,
        durationActual: body.durationActual ?? null,
        notes: body.notes ?? null,
      },
    })
    return NextResponse.json({ data: log }, { status: 201 })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
