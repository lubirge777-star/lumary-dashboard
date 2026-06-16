import { NextResponse } from "next/server"
import { disconnectSocket } from "@/lib/whatsapp-provider"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    await disconnectSocket()
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("whatsapp disconnect error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
