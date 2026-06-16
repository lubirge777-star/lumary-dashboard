import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const platform = searchParams.get("platform")
    const where: Record<string, string> = {}
    if (status) where.status = status
    if (platform) where.platform = platform
    const rows = await prisma.contentCalendar.findMany({
      where,
      orderBy: { scheduledFor: "asc" },
    })
    return NextResponse.json(rows)
  } catch (e) {
    console.error("content-calendar error:", e)
    return NextResponse.json({ error: "Failed to fetch content calendar" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await prisma.contentCalendar.create({ data: body })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error("content-calendar error:", e)
    return NextResponse.json({ error: "Failed to create content calendar entry" }, { status: 500 })
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
    const data: Record<string, string | Date | null> = {}
    if (body.status !== undefined) data.status = body.status
    if (body.postedAt !== undefined) data.postedAt = body.postedAt ? new Date(body.postedAt) : null
    const updated = await prisma.contentCalendar.update({
      where: { id },
      data,
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error("content-calendar error:", e)
    return NextResponse.json({ error: "Failed to update content calendar entry" }, { status: 500 })
  }
}
