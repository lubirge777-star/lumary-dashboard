import { NextRequest, NextResponse } from "next/server"
import { getActivities } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth
  try {
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1"))
    const pageSize = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("pageSize") || "50")))
    const result = await getActivities({ page, pageSize })
    return NextResponse.json(result)
  } catch (e) {
    console.error("activities error:", e)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}
