import { NextRequest, NextResponse } from "next/server"
import { getAISuggestions, dismissAISuggestion } from "@/lib/data-service"

export async function GET() {
  try {
    const suggestions = await getAISuggestions()
    return NextResponse.json(suggestions)
  } catch (e) {
    console.error("ai-suggestions GET error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await dismissAISuggestion(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("ai-suggestions PATCH error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
