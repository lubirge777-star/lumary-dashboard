import { NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { searchParams } = new URL(request.url)
    const weeks = parseInt(searchParams.get("weeks") ?? "8")

    const since = new Date()
    since.setDate(since.getDate() - weeks * 7)

    const rows = await prisma.incomeLog.findMany({
      where: { weekStart: { gte: since } },
      orderBy: { weekStart: "desc" },
    })
    return NextResponse.json(rows)
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await request.json()
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(now.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)

    const existing = await prisma.incomeLog.findFirst({
      where: { weekStart },
    })

    if (existing) {
      const updated = await prisma.incomeLog.update({
        where: { id: existing.id },
        data: {
          amountTsh: body.amountTsh ?? existing.amountTsh,
          amountUsd: body.amountUsd ?? existing.amountUsd,
          clientCount: body.clientCount ?? existing.clientCount,
          retainerCount: body.retainerCount ?? existing.retainerCount,
          paidClients: body.paidClients ?? existing.paidClients,
          unpaidAmount: body.unpaidAmount ?? existing.unpaidAmount,
          notes: body.notes ?? existing.notes,
        },
      })
      return NextResponse.json(updated)
    }

    const created = await prisma.incomeLog.create({
      data: { ...body, weekStart },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
