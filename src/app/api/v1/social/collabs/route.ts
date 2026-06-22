import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const collabs = await prisma.socialMediaCollab.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    return NextResponse.json({ data: collabs })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const collab = await prisma.socialMediaCollab.create({
      data: {
        partnerName: body.partnerName,
        partnerHandle: body.partnerHandle ?? null,
        platform: body.platform,
        followerCount: body.followerCount ?? null,
        offer: body.offer,
      },
    })
    return NextResponse.json({ data: collab }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
