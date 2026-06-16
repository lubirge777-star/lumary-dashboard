import { NextRequest, NextResponse } from "next/server"
import { getPayments } from "@/lib/data-service"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await getPayments()
    const payment = result.items.find((p) => p.id === id)
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }
    return NextResponse.json(payment)
  } catch (e) {
    console.error("payment error:", e)
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
  }
}
