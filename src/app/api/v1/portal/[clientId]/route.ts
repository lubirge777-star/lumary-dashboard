import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { clientId } = await params

    const p = await db()
    if (!p) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }

    const client = await p.client.findUnique({
      where: { id: clientId },
      include: {
        projects: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { createdAt: "desc" } },
        messages: { orderBy: { createdAt: "desc" }, take: 20 },
        retainers: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
