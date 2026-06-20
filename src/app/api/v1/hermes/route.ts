import { NextResponse } from "next/server"

const HERMES_GATEWAY_URL = process.env.HERMES_GATEWAY_URL || "http://localhost:8080"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const response = await fetch(`${HERMES_GATEWAY_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: `Hermes gateway error: ${text}` }, { status: response.status })
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("HERMES PROXY ERROR", e.message)
    return NextResponse.json({ error: "Hermes gateway unreachable", detail: e.message }, { status: 502 })
  }
}
