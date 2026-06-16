import { NextResponse } from "next/server"
import { analyzeMessage, generateQuote, getSuggestedActions } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case "analyze": {
        const result = await analyzeMessage(params.text, params.clientName)
        return NextResponse.json(result)
      }
      case "quote": {
        const result = await generateQuote(params.clientName, params.serviceType, params.description)
        return NextResponse.json(result)
      }
      case "suggest": {
        const actions = await getSuggestedActions(params.client, params.intent)
        return NextResponse.json({ actions })
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (e) {
    console.error("ai suggest error:", e)
    return NextResponse.json({ error: "Failed to process AI suggestion" }, { status: 500 })
  }
}
