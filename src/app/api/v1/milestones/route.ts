import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const rows = await prisma.growthMilestone.findMany({
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(rows)
  } catch (e) {
    console.error("milestones error:", e)
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }
    const body = await request.json()
    const data: Record<string, boolean | Date | null> = {
      isComplete: body.isComplete,
    }
    if (body.isComplete) {
      data.completedAt = new Date()
    } else {
      data.completedAt = null
    }
    const updated = await prisma.growthMilestone.update({
      where: { id },
      data,
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error("milestones error:", e)
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 })
  }
}
