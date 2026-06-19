import { GoogleGenerativeAI } from "@google/generative-ai"

let genAI: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  if (!genAI) genAI = new GoogleGenerativeAI(key)
  return genAI
}

// Model priorities from env: ["gemini-3.5-live-translate","gemini-3-flash-live","gemini-2.5-flash-audio","gemini-2.0-flash"]
function getModelNames(): string[] {
  try {
    const raw = process.env.GEMINI_MODEL_PRIORITY
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return [process.env.GEMINI_MODEL || "gemini-2.0-flash"]
}

// Pick the first available model that has audio capabilities
function getAudioModel(): string {
  const models = getModelNames()
  const audioPreferred = models.find((m) => m.includes("audio") || m.includes("live") || m.includes("flash"))
  return audioPreferred || models[0] || "gemini-2.0-flash"
}

// ── Text generation ──

export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
): Promise<string | null> {
  const client = getClient()
  if (!client) return null

  const models = getModelNames()
  let lastError: unknown = null

  for (const modelName of models) {
    try {
      const model = client.getGenerativeModel({ model: modelName })
      const result = await model.generateContent({
        systemInstruction: systemPrompt,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      })
      return result.response.text()
    } catch (e) {
      lastError = e
    }
  }
  console.error("All Gemini models failed:", lastError)
  return null
}

// ── Audio input (speech → text understanding) ──
// Sends audio bytes to Gemini for transcription/understanding alongside a prompt
export async function transcribeAudio(
  audioBase64: string,
  mimeType: string,
  prompt?: string,
): Promise<string | null> {
  const client = getClient()
  if (!client) return null

  const modelName = getAudioModel()
  try {
    const model = client.getGenerativeModel({ model: modelName })
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          { text: prompt || "Transcribe this audio exactly, including any filler words." },
        ],
      }],
    })
    return result.response.text()
  } catch (e) {
    console.error("Audio transcription failed:", e)
    return null
  }
}

// ── Multimodal generation (text + optional audio/image input) ──
export async function generateWithMedia(
  systemPrompt: string,
  userText: string,
  media?: { mimeType: string; data: string },
): Promise<string | null> {
  const client = getClient()
  if (!client) return null

  const models = getModelNames()
  for (const modelName of models) {
    try {
      const model = client.getGenerativeModel({ model: modelName })
      const parts = []
      if (media) parts.push({ inlineData: { mimeType: media.mimeType, data: media.data } })
      parts.push({ text: userText })
      const result = await model.generateContent({
        systemInstruction: systemPrompt,
        contents: [{ role: "user", parts }],
      })
      return result.response.text()
    } catch (e) {
      console.warn(`Gemini model "${modelName}" failed:`, e)
    }
  }
  return null
}

// ── Chat with streaming (text only) ──

export type ChatRole = "user" | "model"
export interface ChatTurn {
  role: ChatRole
  parts: { text: string }[]
}

export async function chatSendMessage(
  systemPrompt: string,
  history: ChatTurn[],
  message: string,
): Promise<string | null> {
  const client = getClient()
  if (!client) return null

  const models = getModelNames()
  for (const modelName of models) {
    try {
      const model = client.getGenerativeModel({ model: modelName })
      const chat = model.startChat({ systemInstruction: systemPrompt, history })
      const result = await chat.sendMessage(message)
      return result.response.text()
    } catch (e) {
      console.warn(`Gemini model "${modelName}" failed:`, e)
    }
  }
  return null
}

export async function chatSendMessageStream(
  systemPrompt: string,
  history: ChatTurn[],
  message: string,
  onChunk: (chunk: string) => void,
): Promise<string | null> {
  const client = getClient()
  if (!client) return null

  const models = getModelNames()
  for (const modelName of models) {
    try {
      const model = client.getGenerativeModel({ model: modelName })
      const chat = model.startChat({ systemInstruction: systemPrompt, history })
      const result = await chat.sendMessageStream(message)
      let full = ""
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) { full += text; onChunk(text) }
      }
      return full
    } catch (e) {
      console.warn(`Gemini model "${modelName}" failed:`, e)
    }
  }
  return null
}

// ── Live translate ──

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string,
): Promise<string | null> {
  const client = getClient()
  if (!client) return null

  // Prefer live-translate model if configured
  const models = getModelNames()
  const translateModel = models.find((m) => m.includes("translate")) || models[0] || "gemini-2.0-flash"
  try {
    const model = client.getGenerativeModel({ model: translateModel })
    const source = sourceLanguage ? ` from ${sourceLanguage}` : ""
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: `Translate the following${source} to ${targetLanguage}. Return ONLY the translation, no explanations.\n\n${text}` }],
      }],
    })
    return result.response.text()
  } catch (e) {
    console.error("Translation failed:", e)
    return null
  }
}

// ── Intent classification (unchanged) ──

export async function classifyIntent(text: string): Promise<{
  intent: string; confidence: number; suggestedReply: string
} | null> {
  const result = await generateContent(
    `You are a business assistant for LUMARY Studio, a Tanzanian design agency.
Classify the intent of this WhatsApp message from a client.
Respond with valid JSON only (no markdown): {
  "intent": "quote_request" | "status_check" | "complaint" | "payment_question" | "order_update" | "greeting" | "general_inquiry",
  "confidence": 0.0-1.0,
  "suggestedReply": "short Swahili/English reply from LUMARY"
}`,
    text,
  )
  if (!result) return null
  try { return JSON.parse(result) } catch { return null }
}

export async function generateQuote(
  serviceType: string, description: string,
): Promise<{ basePrice: number; recommendedPrice: number; breakdown: string } | null> {
  const result = await generateContent(
    `You are a pricing assistant for LUMARY Studio in Tanzania. Prices are in TSh.
Respond with valid JSON only: { "basePrice": number, "recommendedPrice": number, "breakdown": "short explanation of pricing" }`,
    `Service: ${serviceType}\nDescription: ${description}`,
  )
  if (!result) return null
  try { return JSON.parse(result) } catch { return null }
}

export async function generateDigest(summary: string): Promise<{ recommendations: string[]; insights: string } | null> {
  const result = await generateContent(
    `You are a business analyst for LUMARY Studio.
Analyze this weekly summary and provide actionable insights.
Respond with valid JSON only: { "recommendations": ["string", ...], "insights": "one paragraph summary" }`,
    summary,
  )
  if (!result) return null
  try { return JSON.parse(result) } catch { return null }
}

export async function detectChurnRisk(clientInfo: string): Promise<{ risk: "low" | "medium" | "high"; reasons: string[] } | null> {
  const result = await generateContent(
    `You are a churn analyst for LUMARY Studio.
Assess churn risk for this client.
Respond with valid JSON only: { "risk": "low" | "medium" | "high", "reasons": ["string", ...] }`,
    clientInfo,
  )
  if (!result) return null
  try { return JSON.parse(result) } catch { return null }
}

export async function generateSuggestedActions(clientInfo: string, intent: string): Promise<string[] | null> {
  const result = await generateContent(
    `You are a CRM assistant for LUMARY Studio.
Suggest 2-4 next actions for an agent handling this client.
Respond with valid JSON only: ["action 1", "action 2", ...]`,
    `Client: ${clientInfo}\nDetected intent: ${intent}`,
  )
  if (!result) return null
  try { return JSON.parse(result) } catch { return null }
}

export async function isAvailable(): Promise<boolean> {
  return !!process.env.GEMINI_API_KEY
}

// ── Predictive analysis ──

export async function analyzePatterns(
  data: Record<string, unknown>,
): Promise<{ patterns: string[]; predictions: string[]; recommendations: string[] } | null> {
  const result = await generateContent(
    `You are a predictive analytics engine for a creative studio.
Analyze the cross-domain data below and identify:
1. Patterns that connect personal habits to business outcomes
2. Predictions about what will happen next
3. Actionable recommendations

Respond with valid JSON only: {
  "patterns": ["string", ...],
  "predictions": ["string", ...],
  "recommendations": ["string", ...]
}`,
    JSON.stringify(data, null, 2),
  )
  if (!result) return null
  try { return JSON.parse(result) } catch { return null }
}
