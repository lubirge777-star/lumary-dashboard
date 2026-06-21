/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const pages = await prisma.customPage.findMany({ orderBy: { updatedAt: "desc" } })
    return Response.json(pages)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, slug, config } = await req.json()
    if (!title || !slug || !config) {
      return Response.json({ error: "title, slug, and config required" }, { status: 400 })
    }

    const page = await prisma.customPage.create({
      data: { title, slug, config: JSON.parse(JSON.stringify(config)) },
    })
    return Response.json(page)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json()
    const page = await prisma.customPage.update({ where: { id }, data })
    return Response.json(page)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return Response.json({ error: "id required" }, { status: 400 })
    await prisma.customPage.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
