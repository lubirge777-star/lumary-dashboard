import { NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const items = await prisma.book.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ items })
  } catch (e) { console.error("books error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const item = await prisma.book.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (e) { console.error("books error:", e); return NextResponse.json({ error: "Failed to create" }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
    const body = await req.json()
    const item = await prisma.book.update({ where: { id }, data: body })
    return NextResponse.json(item)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("books error:", e); return NextResponse.json({ error: "Failed to update" }, { status: 500 }) }
}
