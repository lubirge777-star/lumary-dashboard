import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const items = await prisma.grade.findMany({ orderBy: { courseCode: "asc" } })
    return NextResponse.json({ items })
  } catch (e) { console.error("grades error:", e); return NextResponse.json({ error: "Failed to fetch" }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.grade.upsert({
      where: { courseCode_semester: { courseCode: body.courseCode, semester: body.semester || "2025/2026" } },
      update: body,
      create: body,
    })
    return NextResponse.json(item)
  } catch (e) { console.error("grades error:", e); return NextResponse.json({ error: "Failed to create" }, { status: 500 }) }
}
