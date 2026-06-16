import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const track = searchParams.get("track")
    const where = track ? { track } : {}
    const rows = await prisma.learningProgress.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(rows)
  } catch (e) {
    console.error("learning error:", e)
    return NextResponse.json({ error: "Failed to fetch learning progress" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await prisma.learningProgress.create({ data: body })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error("learning error:", e)
    return NextResponse.json({ error: "Failed to create learning progress" }, { status: 500 })
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
    const updated = await prisma.learningProgress.update({
      where: { id },
      data: { streak: body.streak },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error("learning error:", e)
    return NextResponse.json({ error: "Failed to update learning progress" }, { status: 500 })
  }
}
