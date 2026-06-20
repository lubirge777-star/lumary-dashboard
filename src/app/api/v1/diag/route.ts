import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clients = await prisma.client.findMany({ take: 1 })
    return NextResponse.json({ ok: true, count: clients.length })
  } catch (e: any) {
    console.error("DIAG ERROR", JSON.stringify({
      name: e.name,
      code: e.code,
      message: e.message?.slice(0, 500),
      stack: e.stack?.slice(0, 500),
    }, null, 2))
    return NextResponse.json({
      error: true,
      name: e.name,
      code: e.code,
      message: e.message?.slice(0, 500),
    }, { status: 500 })
  }
}
