import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const completion = await prisma.checklistCompletion.create({
      data: { itemId: body.itemId, notes: body.notes ?? null },
    })
    return NextResponse.json({ data: completion }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
