import { NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const rows = await prisma.wedgeLog.findMany({
      orderBy: { clientCount: "desc" },
    })
    return NextResponse.json(rows)
  } catch (e) {
    console.error("wedge error:", e)
    return NextResponse.json({ error: "Failed to fetch wedge logs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await request.json()
    const created = await prisma.wedgeLog.create({ data: body })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error("wedge error:", e)
    return NextResponse.json({ error: "Failed to create wedge log" }, { status: 500 })
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
    const updated = await prisma.wedgeLog.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(updated)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("wedge error:", e)
    return NextResponse.json({ error: "Failed to update wedge log" }, { status: 500 })
  }
}
