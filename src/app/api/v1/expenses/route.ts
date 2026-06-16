import { NextRequest, NextResponse } from "next/server"
import { getExpenses, createExpense } from "@/lib/data-service"

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1")
    const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "50")
    const search = req.nextUrl.searchParams.get("search") || undefined
    const result = await getExpenses({ page, pageSize, search })
    return NextResponse.json(result)
  } catch (e) {
    console.error("expenses error:", e)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const expense = await createExpense(body)
    return NextResponse.json(expense, { status: 201 })
  } catch (e) {
    console.error("expenses error:", e)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
