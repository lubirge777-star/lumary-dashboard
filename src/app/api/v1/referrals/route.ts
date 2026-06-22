import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const referrals = await prisma.referral.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return NextResponse.json({ data: referrals })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const referral = await prisma.referral.create({
      data: {
        clientId: body.clientId,
        referredName: body.referredName ?? null,
        referredPhone: body.referredPhone ?? null,
      },
    })
    return NextResponse.json({ data: referral }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const data: any = {}
    if (body.status) data.status = body.status
    if (body.notes !== undefined) data.notes = body.notes
    const referral = await prisma.referral.update({
      where: { id: body.referralId }, data,
    })
    return NextResponse.json({ data: referral })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
