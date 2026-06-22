import { NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const where = category ? { category } : {}
    const rows = await prisma.quickReply.findMany({ where })
    return NextResponse.json(rows)
  } catch (e) {
    console.error("templates error:", e)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await request.json()
    const created = await prisma.quickReply.create({ data: body })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error("templates error:", e)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }
    await prisma.quickReply.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("templates error:", e)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}
