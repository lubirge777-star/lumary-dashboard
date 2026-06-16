import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rows = await prisma.pipelineStep.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(rows)
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const step = await prisma.pipelineStep.upsert({
      where: { projectId_step: { projectId: id, step: body.step } },
      update: {
        completedAt: body.completedAt ?? null,
        notes: body.notes ?? null,
      },
      create: {
        projectId: id,
        step: body.step,
        completedAt: body.completedAt ?? null,
        notes: body.notes ?? null,
      },
    })
    return NextResponse.json(step)
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
