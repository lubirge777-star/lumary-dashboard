/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const status = await prisma.whatsAppSync.findFirst({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(
      status || { state: "disconnected", messagesToday: 0, messagesTotal: 0, lastMessageAt: null, qr: null }
    )
  } catch {
    return NextResponse.json({ state: "disconnected", messagesToday: 0, messagesTotal: 0 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const sync = await prisma.whatsAppSync.create({
      data: { ...data, createdAt: new Date() } as any,
    })
    return NextResponse.json(sync, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
