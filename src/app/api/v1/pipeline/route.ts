import { NextResponse } from "next/server"
import { getPipelineData } from "@/lib/data-service"

export async function GET() {
  try {
    const data = await getPipelineData()
    return NextResponse.json(data)
  } catch (e) {
    console.error("pipeline error:", e)
    return NextResponse.json({ error: "Failed to fetch pipeline data" }, { status: 500 })
  }
}
