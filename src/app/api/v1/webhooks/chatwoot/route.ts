import { parseWebhookBody, createWebhookResponse } from "@/lib/webhook"
import { logWebhookLog, saveMessage, createActivity } from "@/lib/data-service"

export async function POST(request: Request) {
  try {
    const body = await parseWebhookBody(request)

    const eventType = body.event as string
    const conversation = body.conversation as Record<string, unknown> | undefined
    const message = body.message as Record<string, unknown> | undefined

    await logWebhookLog({
      source: "chatwoot",
      eventType,
      payload: body,
    })

    switch (eventType) {
      case "message_created": {
        const meta = conversation?.meta as Record<string, unknown> | undefined
        const metaSender = meta?.sender as Record<string, unknown> | undefined
        const messageSender = message?.sender as Record<string, unknown> | undefined
        const senderName = (metaSender?.name as string) || (messageSender?.name as string) || "unknown"
        const content = (message?.content as string) || ""
        const conversationId = String(conversation?.id ?? "")

        await saveMessage({
          direction: "INCOMING",
          channel: "chatwoot",
          content,
          clientId: conversationId,
          chatwootMessageId: String(message?.id ?? ""),
        })

        await createActivity({
          type: "MESSAGE_RECEIVED",
          actorName: senderName,
          targetType: "conversation",
          targetId: conversationId,
        })
        break
      }

      case "conversation_created": {
        const meta = conversation?.meta as Record<string, unknown> | undefined
        const sender = meta?.sender as Record<string, unknown> | undefined
        const senderName = (sender?.name as string) || "unknown"
        const conversationId = String(conversation?.id ?? "")

        await createActivity({
          type: "CONVERSATION_STARTED",
          actorName: senderName,
          targetType: "conversation",
          targetId: conversationId,
        })
        break
      }
    }

    return createWebhookResponse(200)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload"
    return createWebhookResponse(400, { error: message })
  }
}

export async function GET() {
  return createWebhookResponse(200, { status: "ok", service: "chatwoot" })
}
