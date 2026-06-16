import { NextResponse } from "next/server"
import { getUnacknowledgedNudges, getUnreadCount } from "@/lib/agent/memory"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [nudges, unread] = await Promise.all([
      getUnacknowledgedNudges(),
      getUnreadCount(),
    ])
    return NextResponse.json({ nudges, unread })
  } catch (e) {
    console.error("agent nudges error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
