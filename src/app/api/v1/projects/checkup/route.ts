/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const where = projectId ? { projectId } : {}
    const checkups = await prisma.projectCheckup.findMany({ where, orderBy: { createdAt: "desc" } })
    return NextResponse.json(checkups)
  } catch (e) {
    console.error("project checkup error:", e)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { projectId, phase, question } = await req.json()
    if (!projectId || !question) return NextResponse.json({ error: "projectId and question required" }, { status: 400 })

    const checkup = await prisma.projectCheckup.create({
      data: { projectId, phase: phase || "general", question, status: "pending", createdAt: new Date() } as any,
    })

    return NextResponse.json(checkup, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { id, answer, status } = await req.json()
    const updateData: any = { updatedAt: new Date() }
    if (answer !== undefined) updateData.answer = answer
    if (status) updateData.status = status
    if (status === "answered") updateData.answeredAt = new Date()
    const updated = await prisma.projectCheckup.update({ where: { id }, data: updateData })
    return NextResponse.json(updated)
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { id } = await req.json()
    await prisma.projectCheckup.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
