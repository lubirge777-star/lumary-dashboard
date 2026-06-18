/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const integrations = await prisma.integration.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(integrations)
  } catch {
    return NextResponse.json([])
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, config, status } = await req.json()
    const updateData: any = { updatedAt: new Date() }
    if (config !== undefined) updateData.config = config
    if (status !== undefined) updateData.status = status
    const updated = await prisma.integration.update({ where: { id }, data: updateData })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const integration = await prisma.integration.create({
      data: { ...data, status: "disconnected", createdAt: new Date(), updatedAt: new Date() } as any,
    })
    return NextResponse.json(integration, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
