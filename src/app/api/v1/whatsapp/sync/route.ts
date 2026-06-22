/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

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
  const auth = await requireAuth()
  if (auth) return auth

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
