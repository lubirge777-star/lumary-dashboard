import { NextResponse } from "next/server"
import { handleBotConversation } from "@/lib/business-agent"
import { saveMessage, findClientByPhone } from "@/lib/data-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, message, clientPhone, clientName, history } = body

    if (!clientId || !message) {
      return NextResponse.json({ error: "clientId and message required" }, { status: 400 })
    }

    let phone = clientPhone
    let name = clientName

    if (!phone || !name) {
      const client = await findClientByPhone(clientPhone || "")
      if (client) {
        phone = client.whatsappNumber
        name = client.name
      }
    }

    const reply = await handleBotConversation(clientId, phone || "", name || "", message, history || [])

    if (reply) {
      await saveMessage({
        direction: "OUTGOING",
        channel: "bot",
        content: reply,
        clientId,
      })
    }

    return NextResponse.json({ reply })
  } catch (e) {
    console.error("bot error:", e)
    return NextResponse.json({ error: "Failed to process bot conversation" }, { status: 500 })
  }
}
