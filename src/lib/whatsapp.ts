const BRIDGE = process.env.WHATSAPP_BRIDGE_URL || "http://localhost:3001"

async function bridgeFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BRIDGE}${path}`, {
      ...options,
      signal: AbortSignal.timeout(5000),
    })
    return await res.json()
  } catch {
    return null
  }
}

export async function checkWhatsAppConnection(): Promise<{ connected: boolean; state?: string; qrUrl?: string }> {
  const status = await bridgeFetch("/status")
  if (!status) return { connected: false, state: "offline" }
  return {
    connected: status.connected,
    state: status.state,
    qrUrl: status.qrAvailable ? `${BRIDGE}/qr` : undefined,
  }
}

export async function sendWhatsApp(to: string, text: string): Promise<{ success: boolean; error?: string }> {
  const result = await bridgeFetch("/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, text }),
  })
  if (!result) return { success: false, error: "Bridge offline. Start whatsapp-bridge on your PC." }
  if (result.error) return { success: false, error: result.error }
  return { success: true }
}

export async function sendMediaWhatsApp(
  to: string, caption: string, _mediaUrl: string, _mediaType: "image" | "document" = "image"
): Promise<{ success: boolean; error?: string }> {
  return sendWhatsApp(to, `${caption}\n${_mediaUrl}`)
}
