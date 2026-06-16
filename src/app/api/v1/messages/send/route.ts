import { NextResponse } from "next/server"
import { sendWhatsApp } from "@/lib/whatsapp"
import { saveMessage, createActivity, findClientByPhone } from "@/lib/data-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, message, clientId } = body

    if (!to || !message) {
      return NextResponse.json({ error: "Missing required fields: to, message" }, { status: 400 })
    }

    const result = await sendWhatsApp(to, message)

    if (result.success && clientId) {
      await saveMessage({
        direction: "outbound",
        channel: "whatsapp",
        content: message,
        clientId,
      })
      await createActivity({
        type: "MESSAGE_SENT",
        actorName: "Agent",
        targetType: "Message",
        targetId: clientId,
        meta: { content: message.substring(0, 100) },
      })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error("messages send error:", e)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
