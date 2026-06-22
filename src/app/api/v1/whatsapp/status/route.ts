import { NextResponse } from "next/server"
import { getConnectionState, startSocket } from "@/lib/whatsapp-provider"
import { requireAuth } from "@/lib/require-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    await startSocket()
    const state = getConnectionState()
    return NextResponse.json(state)
  } catch (e) {
    console.error("whatsapp status error:", e)
    return NextResponse.json({ error: "Failed to get WhatsApp status" }, { status: 500 })
  }
}
