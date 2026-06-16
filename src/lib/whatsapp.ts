import { getConnectionState, sendMessage as baileysSendMessage, startSocket, getQR } from "./whatsapp-provider"

export async function checkEvolutionConnection(): Promise<{ connected: boolean; state?: string; qrUrl?: string; managerUrl?: string }> {
  await startSocket()
  const { state, connected } = getConnectionState()
  return { connected, state, qrUrl: connected ? undefined : "/api/v1/whatsapp/qr" }
}

export async function sendWhatsApp(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  await startSocket()
  const { connected } = getConnectionState()

  if (!connected) {
    return { success: false, error: "WhatsApp not connected. Scan QR code to connect." }
  }

  const ok = await baileysSendMessage(to, message)
  if (!ok) {
    return { success: false, error: "Failed to send message. Check WhatsApp connection." }
  }

  return { success: true }
}

export async function sendMediaWhatsApp(
  to: string,
  caption: string,
  mediaUrl: string,
  mediaType: "image" | "document" = "image"
): Promise<{ success: boolean; error?: string }> {
  return sendWhatsApp(to, `${caption}\n${mediaUrl}`)
}
