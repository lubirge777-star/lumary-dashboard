/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { chatSendMessageStream, isAvailable } from "@/lib/gemini"
import type { ChatTurn } from "@/lib/gemini"

function sse(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  if (!await isAvailable()) {
    return new Response(sse("error", { message: "Agent unavailable" }), {
      headers: { "Content-Type": "text/event-stream" },
    })
  }

  const { message, history = [] } = await req.json()
  const clientId = req.nextUrl.pathname.split("/")[4]

  if (!message?.trim()) {
    return new Response(sse("error", { message: "Message is required" }), {
      headers: { "Content-Type": "text/event-stream" },
    })
  }

  // Fetch only this client's data
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      projects: true,
      payments: true,
      messages: { orderBy: { createdAt: "desc" }, take: 20 },
      retainers: true,
    },
  })

  if (!client) {
    return new Response(sse("error", { message: "Client not found" }), {
      headers: { "Content-Type": "text/event-stream" },
    })
  }

  const context = `[CLIENT CONTEXT]
Name: ${client.name}
Status: ${client.status}
Total Spent: TSh ${client.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0).toLocaleString()}
Projects: ${client.projects.length} total (${client.projects.filter((p) => !["PAID", "FINAL_DELIVERED", "CANCELLED"].includes(p.status)).length} active)
Payments: ${client.payments.length} total (${client.payments.filter((p) => p.status !== "PAID").length} pending)
Retainers: ${client.retainers.length}
Recent Messages: ${client.messages.length}`

  const systemPrompt = `You are the LUMARY Client Assistant — a helpful AI that answers client questions about their projects and account with LUMARY Studio.

You are speaking with ${client.name}. Be polite, professional, and helpful. Answer only using the data provided in the context below.

## What you can do
- Answer questions about their projects, payments, retainers, and messages
- Explain project status in simple terms
- Tell them what's coming up next (payments due, deliverables)
- Provide contact information for follow-up

## Rules
1. NEVER reveal internal business data or other clients' information
2. NEVER discuss internal pricing or business operations
3. If you don't know something, say "I'll have the LUMARY team follow up with you on that"
4. Be warm and professional — this is a client-facing experience
5. Translate to Swahili if the client messages in Swahili
6. ONLY reference data from the client context above`

  const turns: ChatTurn[] = history.map((h: any) => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }],
  }))

  const enriched = `${context}\n\n[CLIENT MESSAGE]\n${message}`

  const stream = new ReadableStream({
    async start(controller) {
      let full = ""
      await chatSendMessageStream(systemPrompt, turns, enriched, (chunk) => {
        full += chunk
        controller.enqueue(encoder.encode(sse("chunk", { text: chunk })))
      })
      controller.enqueue(encoder.encode(sse("done", { full: full || "I'm sorry, I couldn't process that. Please try again." })))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  })
}
