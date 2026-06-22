import { NextResponse } from "next/server"
import { getPipelineData } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const data = await getPipelineData()
    return NextResponse.json(data)
  } catch (e) {
    console.error("pipeline error:", e)
    return NextResponse.json({ error: "Failed to fetch pipeline data" }, { status: 500 })
  }
}
