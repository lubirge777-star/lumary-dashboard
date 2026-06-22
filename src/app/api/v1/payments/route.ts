import { NextRequest, NextResponse } from "next/server"
import { getPayments, createPayment } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1"))
    const pageSize = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("pageSize") || "50")))
    const search = req.nextUrl.searchParams.get("search") || undefined
    const status = req.nextUrl.searchParams.get("status") || undefined
    const method = req.nextUrl.searchParams.get("method") || undefined
    const result = await getPayments({ page, pageSize, search, status, method })
    return NextResponse.json(result)
  } catch (e) {
    console.error("payments error:", e)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const payment = await createPayment(body)
    return NextResponse.json(payment, { status: 201 })
  } catch (e) {
    console.error("payments error:", e)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
