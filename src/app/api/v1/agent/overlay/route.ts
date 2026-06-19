/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { chatSendMessageStream, isAvailable } from "@/lib/gemini"
import type { ChatTurn } from "@/lib/gemini"

const SYSTEM_PROMPT = `You are the LUMARY AI Agent — the executive assistant for a creative studio dashboard.

You are embedded in the dashboard UI. The user is on a specific page and can ask you anything about any data.

## Capabilities
- Answer questions about any data in the system (clients, projects, payments, habits, goals, etc.)
- Navigate the user to other pages
- Execute actions through the action system

## Action System
When you suggest a specific, executable action, include it in your response using this format on its own line:
[ACTION:{"label":"Action Label","description":"Optional description","apiRoute":"/api/v1/...","method":"POST","body":{...}}]
The user can then click a button to execute it. Only include executable API calls.

Available action routes: /api/v1/clients (GET/POST), /api/v1/projects (GET/POST), /api/v1/payments (GET/POST), /api/v1/habit-logs (POST), /api/v1/agent/cron (GET), /api/v1/custom-pages (GET/POST/PATCH/DELETE), and any other dashboard API.

## Generating Custom Pages
You can create custom dashboard pages on demand using the create-custom-page action.
Example: [ACTION:{"label":"Create Dashboard","apiRoute":"/api/v1/agent/action","method":"POST","body":{"action":"create-custom-page","body":{"title":"My Widgets","slug":"my-widgets","config":{"title":"My Widgets","layout":"grid","blocks":[{"type":"kpi","title":"Total Clients","dataSource":"/api/v1/clients"},{"type":"chart","title":"Revenue","dataSource":"/api/v1/payments","chartType":"bar"}]}}}}]

## Rules
1. NEVER list your capabilities back to the user
2. Be concise and proactive
3. When suggesting multi-step actions, include action blocks for each step
4. Use Swahili or English naturally
5. Always reference what page they're on and offer relevant help
6. When showing data, format it clearly with markdown`

function sse(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  if (!await isAvailable()) {
    return new Response(sse("error", { message: "Gemini API key not configured" }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    })
  }

  const { message, page, history = [] } = await req.json()
  if (!message?.trim()) {
    return new Response(sse("error", { message: "Message is required" }), {
      headers: { "Content-Type": "text/event-stream" },
    })
  }

  // Build page-aware context
  const pageContext = await buildPageContext(page)
  const enrichedMessage = `${pageContext}\n\n[USER on "${page}"]\n${message}`

  const turns: ChatTurn[] = history.map((h: any) => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }],
  }))

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = ""

      const result = await chatSendMessageStream(SYSTEM_PROMPT, turns, enrichedMessage, (chunk) => {
        fullText += chunk
        controller.enqueue(encoder.encode(sse("chunk", { text: chunk })))
      })

      if (result) {
        // Parse actions from the response
        const actions = parseActions(fullText)
        // Clean actions from displayed text
        const cleanText = fullText.replace(/\[ACTION:.*?\]/g, "").trim()
        controller.enqueue(encoder.encode(sse("done", { full: cleanText, actions })))
      } else {
        controller.enqueue(encoder.encode(sse("error", { message: "Agent response failed." })))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  })
}

async function buildPageContext(page: string): Promise<string> {
  try {
    const global = await Promise.all([
      prisma.client.count(),
      prisma.project.count({ where: { status: { in: ["IN_PROGRESS", "REVISION", "DEPOSIT_PAID"] } } }),
      prisma.project.count({ where: { status: "NEW_INQUIRY" } }),
      prisma.payment.count({ where: { status: "UNPAID" } }),
      prisma.payment.aggregate({ where: { status: "UNPAID" }, _sum: { amount: true } }),
    ])

    const customCount = await prisma.customPage.count()
    let pageSpecific = `Custom pages: ${customCount}.`
    if (page === "/" || page === "") {
      const monthlyRevenue = await prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } })
      pageSpecific = `This is the Overview page. Monthly revenue: TSh ${(monthlyRevenue._sum.amount || 0).toLocaleString()}.`
    } else if (page.startsWith("/clients")) {
      const recent = await prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { name: true, status: true } })
      pageSpecific = `Clients page. Recent clients: ${recent.map((c) => `${c.name} (${c.status})`).join(", ")}.`
    } else if (page.startsWith("/projects") || page.startsWith("/pipeline")) {
      const statusCounts = await prisma.project.groupBy({ by: ["status"], _count: true })
      pageSpecific = `Pipeline page. Status breakdown: ${statusCounts.map((s) => `${s.status}: ${s._count}`).join(", ")}.`
    } else if (page.startsWith("/finance")) {
      const paid = await prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } })
      pageSpecific = `Finance page. Total paid: TSh ${(paid._sum.amount || 0).toLocaleString()}.`
    } else if (page.startsWith("/habits")) {
      const done = await prisma.habitLog.count({ where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }, completed: true } })
      pageSpecific = `Habits page. Completed today: ${done}/10.`
    }

    return `[CONTEXT] ${global[0]} clients · ${global[1]} active · ${global[2]} inquiries · ${global[3]} unpaid (TSh ${(global[4]._sum.amount || 0).toLocaleString()}). ${pageSpecific}`
  } catch {
    return ""
  }
}

function parseActions(text: string): { label: string; description?: string; apiRoute?: string; method?: string; body?: Record<string, unknown> }[] {
  const actions: any[] = []
  const regex = /\[ACTION:(\{.*?\})\]/g
  let match
  while ((match = regex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1])
      if (parsed.label) actions.push(parsed)
    } catch {}
  }
  return actions
}
