import { NextResponse } from "next/server"
import { runAgentCheck } from "@/lib/agent/engine"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const nudges = await runAgentCheck()
    return NextResponse.json({ nudges, count: nudges.length })
  } catch (e) {
    console.error("agent check error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
