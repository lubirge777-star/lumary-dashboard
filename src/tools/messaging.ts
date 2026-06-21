import { prisma } from "@/lib/prisma"
import { sendWhatsApp } from "@/lib/whatsapp"
import type { ToolDef } from "./types"

export const messagingTools: ToolDef[] = [
  {
    name: "send_whatsapp",
    description: "Send a WhatsApp message to a client by phone number. Returns success or error.",
    parameters: {
      to: { type: "string", description: "Recipient phone number (e.g. 255651360001)", required: true },
      message: { type: "string", description: "Message text to send", required: true },
    },
    handler: async (args) => {
      const result = await sendWhatsApp(args.to as string, args.message as string)
      if (!result.success) return { success: false, error: result.error }
      return { success: true, data: { sent: true, to: args.to } }
    },
  },
  {
    name: "get_conversation",
    description: "Get message history with a specific client.",
    parameters: {
      clientId: { type: "string", description: "Client ID", required: true },
      limit: { type: "number", description: "Max messages (default 50)" },
    },
    handler: async (args) => {
      const messages = await prisma.message.findMany({
        where: { clientId: args.clientId as string },
        orderBy: { createdAt: "desc" },
        take: (args.limit as number) ?? 50,
      })
      return { success: true, data: messages.reverse() }
    },
  },
  {
    name: "get_client_phone",
    description: "Look up a client's phone number by name or ID.",
    parameters: {
      query: { type: "string", description: "Client name or ID", required: true },
    },
    handler: async (args) => {
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { id: args.query as string },
            { name: { contains: args.query as string, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, whatsappNumber: true },
      })
      if (!client) return { success: false, error: "Client not found" }
      return { success: true, data: client }
    },
  },
]
