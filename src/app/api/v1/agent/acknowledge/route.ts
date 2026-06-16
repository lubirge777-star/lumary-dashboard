import { NextRequest, NextResponse } from "next/server"
import { acknowledgeNudge, acknowledgeAllByType, acknowledgeAll } from "@/lib/agent/memory"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")
    const type = req.nextUrl.searchParams.get("type")

    if (id) {
      await acknowledgeNudge(id)
    } else if (type) {
      await acknowledgeAllByType(type)
    } else {
      await acknowledgeAll()
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("agent acknowledge error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
