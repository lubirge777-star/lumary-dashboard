/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const sessions = await prisma.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, updatedAt: true, createdAt: true, _count: { select: { messages: true } } },
  })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json()
    const session = await prisma.chatSession.create({
      data: { title: title || "New Chat" },
    })
    return NextResponse.json(session, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, title } = await req.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const session = await prisma.chatSession.update({
      where: { id },
      data: { title, updatedAt: new Date() },
    })
    return NextResponse.json(session)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await prisma.chatSession.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
