import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const stages = await prisma.productTransition.findMany({ orderBy: { startedAt: "desc" } })
    const current = stages.find((s) => s.isCurrent) ?? null
    return NextResponse.json({ data: { currentStage: current, history: stages } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    await prisma.productTransition.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } })
    const transition = await prisma.productTransition.create({
      data: {
        stage: body.stage,
        metrics: body.metrics ? (typeof body.metrics === "string" ? JSON.parse(body.metrics) : body.metrics) : null,
        notes: body.notes ?? null,
        isCurrent: true,
      },
    })
    return NextResponse.json({ data: transition }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
