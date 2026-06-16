import { NextRequest, NextResponse } from "next/server"
import { getWebhookLogs } from "@/lib/data-service"

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1")
    const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "50")
    const result = await getWebhookLogs({ page, pageSize })
    return NextResponse.json(result)
  } catch (e) {
    console.error("webhook events error:", e)
    return NextResponse.json({ error: "Failed to fetch webhook events" }, { status: 500 })
  }
}
