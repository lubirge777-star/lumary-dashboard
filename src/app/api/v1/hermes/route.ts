import { NextResponse } from "next/server"
import { getToolDefs, executeTool, type ToolParam } from "@/tools"

const HERMES_GATEWAY_URL = process.env.HERMES_GATEWAY_URL || "http://localhost:8080"
const SYSTEM_PROMPT = `You are Hermes, an AI agent that controls the LUMARY dashboard for Lubirge.

You have tools to:
- Create/dismiss/list reminders that appear in the dashboard notification bell
- Send WhatsApp messages to clients
- Query and create clients and projects
- Get dashboard metrics (revenue, active clients, unpaid invoices)
- Get finance summaries
- Log activities in the dashboard feed
- Query today's goals

When a user asks you to do something, use the appropriate tool.
If you don't have a tool for the request, explain what tools you have available.
Keep responses concise and actionable. Use Swahili or English as appropriate.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(body.messages ?? []),
    ]

    const response = await fetch(`${HERMES_GATEWAY_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: body.model || "hermes-3-llama-3.1-8b",
        messages,
        tools: getToolDefs(),
        tool_choice: "auto",
        max_tokens: body.max_tokens ?? 2048,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: `Hermes gateway error: ${text}`, toolResults: [] }, { status: response.status })
    }

    const data = await response.json()
    const choice = data.choices?.[0]
    if (!choice) return NextResponse.json(data)

    const toolResults: { name: string; args: Record<string, ToolParam>; result: any }[] = []

    if (choice.message?.tool_calls) {
      for (const call of choice.message.tool_calls) {
        const name = call.function.name
        const args = JSON.parse(call.function.arguments || "{}")
        const result = await executeTool(name, args)
        toolResults.push({ name, args, result })
      }

      const followUpMessages = [...messages, choice.message]
      for (const tr of toolResults) {
        followUpMessages.push({
          role: "tool",
          tool_call_id: tr.name,
          content: JSON.stringify(tr.result),
        })
      }

      const followUp = await fetch(`${HERMES_GATEWAY_URL}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: body.model || "hermes-3-llama-3.1-8b",
          messages: followUpMessages,
          max_tokens: body.max_tokens ?? 1024,
        }),
      })

      if (followUp.ok) {
        const followUpData = await followUp.json()
        return NextResponse.json({
          ...followUpData,
          toolResults,
        })
      }
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error("HERMES ERROR", e.message)
    return NextResponse.json({ error: "Hermes unreachable", detail: e.message }, { status: 502 })
  }
}
