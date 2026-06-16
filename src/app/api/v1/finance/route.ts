import { NextResponse } from "next/server"
import { getFinanceSummary, getPayments, getExpenses } from "@/lib/data-service"

export async function GET() {
  try {
    const summary = await getFinanceSummary()
    const payments = await getPayments()
    const expenses = await getExpenses()
    return NextResponse.json({ ...summary, payments, expenses })
  } catch (e) {
    console.error("finance error:", e)
    return NextResponse.json({ error: "Failed to fetch finance data" }, { status: 500 })
  }
}
