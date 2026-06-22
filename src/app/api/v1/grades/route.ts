import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const items = await prisma.grade.findMany({ orderBy: { courseCode: "asc" } })
    return NextResponse.json({ items })
  } catch (e) { console.error("grades error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const item = await prisma.grade.upsert({
      where: { courseCode_semester: { courseCode: body.courseCode, semester: body.semester || "2025/2026" } },
      update: body,
      create: body,
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e) { console.error("grades error:", e); return NextResponse.json({ error: "Failed to create" }, { status: 500 }) }
}
