import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const posts = await prisma.socialMediaPost.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    return NextResponse.json({ data: posts })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const post = await prisma.socialMediaPost.create({
      data: {
        platform: body.platform, pillar: body.pillar,
        contentType: body.contentType, title: body.title ?? null,
        status: body.status ?? "draft",
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      },
    })
    return NextResponse.json({ data: post }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    await prisma.socialMediaPost.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
