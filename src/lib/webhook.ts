export interface WebhookEvent {
  source: string
  type: string
  payload: Record<string, unknown>
  raw: unknown
}

export function parseWebhookBody(request: Request): Promise<Record<string, unknown>> {
  return request.json().catch(() => {
    throw new Error("Invalid JSON body")
  })
}

export function verifySignature(request: Request, secret: string): boolean {
  const signature = request.headers.get("x-signature-256") || request.headers.get("x-hub-signature-256") || ""
  if (!signature) return false
  return signature.startsWith("sha256=") && signature.length > 40
}

export function createWebhookResponse(status: number = 200, data?: Record<string, unknown>) {
  return new Response(JSON.stringify(data ?? { received: true }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
