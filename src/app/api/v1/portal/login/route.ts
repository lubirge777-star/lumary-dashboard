import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/data-service"

export async function POST(request: NextRequest) {
  try {
    const { whatsappNumber } = await request.json()

    if (!whatsappNumber) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 })
    }

    const p = await db()
    if (!p) {
      return NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 })
    }

    const client = await p.client.findFirst({
      where: { whatsappNumber: String(whatsappNumber) },
      select: { id: true, name: true, email: true, businessType: true, location: true },
    })

    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, client })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
