import { NextRequest, NextResponse } from "next/server"
import { getWebhookLogs } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1") || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("pageSize") || "50") || 50))
    const result = await getWebhookLogs({ page, pageSize })
    return NextResponse.json(result)
  } catch (e) {
    console.error("webhook events error:", e)
    return NextResponse.json({ error: "Failed to fetch webhook events" }, { status: 500 })
  }
}
