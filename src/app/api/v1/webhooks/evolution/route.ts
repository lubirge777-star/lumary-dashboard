import { parseWebhookBody, createWebhookResponse } from "@/lib/webhook"
import { logWebhookLog, findClientByPhone, saveMessage, createActivity, db } from "@/lib/data-service"
import { evaluateRules } from "@/lib/automation"
import { processIncomingMessage } from "@/lib/business-agent"

export async function POST(request: Request) {
  try {
    const body = await parseWebhookBody(request)
    const eventType = (body.event as string) || (body.type as string) || "unknown"
    const data = body.data as Record<string, unknown> | undefined

    await logWebhookLog({ source: "evolution", eventType, payload: data ?? body, status: "received" })

    if (eventType === "messages.upsert" && data) {
      const key = data.key as Record<string, unknown> | undefined
      const message = data.message as Record<string, unknown> | undefined

      if (key && message) {
        const remoteJid = (key.remoteJid as string) || ""
        const phone = remoteJid.replace(/@s\.whatsapp\.net$/, "")
        const conversation = (message.conversation as string) || ""
        const extendedText = (message.extendedTextMessage as Record<string, unknown> | undefined)?.text as string | undefined
        const text = conversation || extendedText || ""

        if (phone && text) {
          const client = await findClientByPhone(phone)
          if (client) {
            // Save incoming message
            const saved = await saveMessage({
              direction: "inbound",
              channel: "whatsapp",
              content: text,
              clientId: client.id,
              evolutionMessageId: key.id as string | undefined,
            })
            if (saved) {
              await createActivity({
                type: "MESSAGE_RECEIVED",
                actorName: client.name,
                targetType: "Message",
                targetId: saved.id,
              })

              // Evaluate automation rules
              await evaluateRules("message_received", {
                type: "message_received",
                clientId: client.id,
                clientPhone: phone,
                messageContent: text,
                clientName: client.name,
              })

              // Autonomous agent processing
              const p = await db()
              let autonomyLevel = "auto_simple" // default
              if (p) {
                const setting = await p.automationRule.findFirst({ where: { name: "autonomy_level" } })
                if (setting?.description) autonomyLevel = setting.description
              }

              await processIncomingMessage(
                text,
                client.id,
                phone,
                client.name,
                autonomyLevel as any,
              )
            }
          }
        }
      }
    }

    return createWebhookResponse(200)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload"
    return createWebhookResponse(400, { error: message })
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "ok", service: "evolution" }), {
    headers: { "Content-Type": "application/json" },
  })
}
