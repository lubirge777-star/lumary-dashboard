import { NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

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
  const auth = await requireAuth()
  if (auth) return auth

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
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("milestones error:", e)
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 })
  }
}
