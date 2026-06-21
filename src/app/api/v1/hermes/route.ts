import { NextResponse } from "next/server"
import { getToolDefs, executeTool, type ToolParam } from "@/tools"

const HERMES_GATEWAY_URL = process.env.HERMES_GATEWAY_URL || "http://localhost:8080"
const SYSTEM_PROMPT = `You are Hermes, an AI agent that fully controls the LUMARY dashboard for Lubirge.

You can do ANYTHING in the app:
- Dashboard: view live metrics, activity feed, today briefing (habits, goals, payments)
- Clients: search, view details (with projects/payments/messages), create, update, delete
- Projects: search, view detail (with steps/payments), create, update status (auto-logs pipeline steps), delete
- Finance: payments (list, create, update), expenses (list, create), retainers (list, create, update), monthly P&L summary
- WhatsApp: send messages, look up client phone numbers, view conversation history
- Reminders: create (appears in bell notification), dismiss, list active ones
- Goals: view by level, create, update
- Habits: view today's status, toggle done/undone
- Journal: view entries, write new entries
- Books: view reading list
- Timer: view focus session stats
- Calendar: view and create appointments/events
- Learning: view progress across tracks
- Content Calendar: view scheduled posts
- Automation: view rules
- Settings: view user config
- Activity feed: log new entries

Always use tools when asked to do something. If you need more info, ask.
Keep responses concise and actionable. Use Swahili or English as appropriate. The user is named Lubirge.`

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
