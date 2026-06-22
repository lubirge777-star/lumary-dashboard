import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const where: any = {}
    if (category) where.category = category
    const items = await prisma.checklistItem.findMany({
      where, orderBy: { sortOrder: "asc" },
      include: { completions: { orderBy: { completedAt: "desc" }, take: 1 } },
    })
    const data = items.map((i) => ({
      id: i.id, title: i.title, description: i.description,
      category: i.category, isRequired: i.isRequired,
      done: i.completions.length > 0,
      lastCompleted: i.completions[0]?.completedAt ?? null,
    }))
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const last = await prisma.checklistItem.findFirst({
      where: { category: body.category },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    })
    const item = await prisma.checklistItem.create({
      data: {
        category: body.category, title: body.title,
        description: body.description ?? null,
        isRequired: body.isRequired ?? true,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    })
    return NextResponse.json({ data: item }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
