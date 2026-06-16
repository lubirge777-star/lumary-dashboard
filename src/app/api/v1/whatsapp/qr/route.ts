import { NextResponse } from "next/server"
import { getQR, startSocket } from "@/lib/whatsapp-provider"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await startSocket()
    const qr = await getQR()
    if (!qr) {
      return NextResponse.json({ qr: null, message: "No QR code available yet. Try again in a few seconds." })
    }
    return NextResponse.json({ qr })
  } catch (e) {
    console.error("whatsapp QR error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
