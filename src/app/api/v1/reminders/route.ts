import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const reminders = await prisma.reminder.findMany({
      where: { dismissed: false },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 50,
    })
    return NextResponse.json(reminders)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const reminder = await prisma.reminder.create({
      data: {
        title: body.title,
        context: body.context ?? null,
        priority: body.priority ?? "medium",
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
      },
    })
    return NextResponse.json(reminder, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    if (body.dismiss) {
      await prisma.reminder.updateMany({
        where: { id: { in: Array.isArray(body.dismiss) ? body.dismiss : [body.dismiss] } },
        data: { dismissed: true },
      })
    }
    if (body.update) {
      await prisma.reminder.update({
        where: { id: body.update.id },
        data: body.update.data,
      })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
