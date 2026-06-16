import { sendWhatsApp } from "@/lib/whatsapp"
import { createActivity, saveMessage } from "@/lib/data-service"
import * as gemini from "@/lib/gemini"
import { analyzeMessage } from "@/lib/ai"

export type AutonomyLevel = "off" | "suggest_only" | "auto_simple" | "auto_all"

export interface AgentDecision {
  handled: boolean
  action: "auto_replied" | "escalated" | "ignored"
  intent: string
  confidence: number
  reply?: string
  reason: string
}

const KNOWLEDGE_BASE = `
LUMARY Studio is a Tanzanian creative design agency based in Mwanza.

SERVICES & PRICING (in TSh):
1. Brand Starter — 150,000 TSh
   Logo design, business card, letterhead, social media profile photos
2. Social Media Pack — 120,000 TSh
   10 social media posts, 5 stories, 2 banners
3. CV Redesign — 10,000 TSh
   Professional CV layout redesign
4. Thumbnails — 5,000 TSh each
   YouTube/Video thumbnails
5. Weekly Promo Pack — 80,000 TSh/month
   4 promo graphics per week, 2 stories per week

PAYMENT: M-PESA (Tigo Pesa, Airtel Money), Bank transfer, Cash
PAYMENT TERMS: 50% deposit to start, 50% on delivery
CONTACT: +255 65 136 0763, lubirge@lumary.com
ADDRESS: P.O. Box 169, Mwanza, Tanzania
WORKING HOURS: Mon-Fri 9AM-6PM EAT, Sat 9AM-2PM
`

const AUTO_INTENTS = new Set(["greeting", "payment_question", "order_update"])
const ESCALATE_INTENTS = new Set(["complaint"])

function isAfterHours(): boolean {
  const now = new Date()
  const hour = now.getUTCHours() + 3 // EAT (UTC+3)
  const day = now.getUTCDay()
  if (day === 0) return true // Sunday
  if (day === 6) return hour < 9 || hour >= 14 // Saturday 9AM-2PM
  return hour < 9 || hour >= 18 // Weekdays 9AM-6PM
}

export async function processIncomingMessage(
  text: string,
  clientId: string,
  clientPhone: string,
  clientName: string,
  autonomyLevel: AutonomyLevel = "auto_simple",
): Promise<AgentDecision> {
  if (autonomyLevel === "off") {
    return { handled: false, action: "ignored", intent: "unknown", confidence: 0, reason: "Autonomy is disabled" }
  }

  // Analyze intent using Gemini or fallback
  const analysis = await analyzeMessage(text, clientName)

  // Save the incoming message
  await saveMessage({
    direction: "INCOMING",
    channel: "whatsapp",
    content: text,
    clientId,
  })

  await createActivity({
    type: "MESSAGE_RECEIVED",
    targetType: "Client",
    targetId: clientId,
    meta: { intent: analysis.intentKey, autonomyLevel },
  })

  const isAutoReplyIntent = AUTO_INTENTS.has(analysis.intentKey)
  const isEscalateIntent = ESCALATE_INTENTS.has(analysis.intentKey)
  const isHighConfidence = analysis.confidence >= 0.7

  // After-hours auto-reply
  if (isAfterHours()) {
    const afterHoursReply = `Habari ${clientName}! Asante kwa ujumbe wako. Ofisi zetu zimefungwa kwa sasa. Tutakujibu kesho kuanzia saa 3 asubuhi (9AM).\n\nTumepokea ujumbe wako na tutakushughulikia haraka iwezekanavyo.`
    const result = await sendWhatsApp(clientPhone, afterHoursReply)
    if (result.success) {
      await saveMessage({ direction: "OUTGOING", channel: "whatsapp", content: afterHoursReply, clientId })
      await createActivity({ type: "AUTOMATION_RUN", targetType: "Client", targetId: clientId, meta: { action: "after_hours_auto_reply" } })
    }
    return {
      handled: true,
      action: "auto_replied",
      intent: analysis.intentKey,
      confidence: analysis.confidence,
      reply: afterHoursReply,
      reason: "After-hours auto-reply sent",
    }
  }

  // Auto-reply for simple intents
  if ((autonomyLevel === "auto_simple" || autonomyLevel === "auto_all") && isAutoReplyIntent && isHighConfidence) {
    const result = await sendWhatsApp(clientPhone, analysis.suggestedReply)
    if (result.success) {
      await saveMessage({ direction: "OUTGOING", channel: "whatsapp", content: analysis.suggestedReply, clientId })
      await createActivity({ type: "MESSAGE_SENT", targetType: "Client", targetId: clientId, meta: { autoReplied: true, intent: analysis.intentKey } })
    }
    return {
      handled: true,
      action: "auto_replied",
      intent: analysis.intentKey,
      confidence: analysis.confidence,
      reply: analysis.suggestedReply,
      reason: `Auto-replied to ${analysis.intentKey} (confidence: ${analysis.confidence})`,
    }
  }

  // Auto-all: reply to everything with high confidence
  if (autonomyLevel === "auto_all" && isHighConfidence && !isEscalateIntent) {
    const result = await sendWhatsApp(clientPhone, analysis.suggestedReply)
    if (result.success) {
      await saveMessage({ direction: "OUTGOING", channel: "whatsapp", content: analysis.suggestedReply, clientId })
    }
    return {
      handled: true,
      action: "auto_replied",
      intent: analysis.intentKey,
      confidence: analysis.confidence,
      reply: analysis.suggestedReply,
      reason: `Auto-replied (auto_all mode) to ${analysis.intentKey}`,
    }
  }

  // Escalate complaints
  if (isEscalateIntent) {
    await createActivity({
      type: "AUTOMATION_RUN",
      targetType: "Client",
      targetId: clientId,
      meta: { action: "escalated", intent: analysis.intentKey, reason: "Complaint requires human attention" },
    })
    return {
      handled: false,
      action: "escalated",
      intent: analysis.intentKey,
      confidence: analysis.confidence,
      reason: `Escalated: ${analysis.intentKey} requires human attention`,
    }
  }

  return {
    handled: false,
    action: "escalated",
    intent: analysis.intentKey,
    confidence: analysis.confidence,
    reason: `Low confidence (${analysis.confidence}) or unsupported intent (${analysis.intentKey}) — flagged for human`,
  }
}

export async function getAgentStats() {
  return { totalToday: 0 }
}

export async function handleBotConversation(
  clientId: string,
  clientPhone: string,
  clientName: string,
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  if (await gemini.isAvailable()) {
    const context = conversationHistory.slice(-10).map(m => `${m.role === "user" ? "Client" : "Bot"}: ${m.content}`).join("\n")
    const prompt = `You are a helpful business assistant for LUMARY Studio, a Tanzanian creative design agency.

${KNOWLEDGE_BASE}

Previous conversation:
${context}

Client: ${message}

Respond conversationally and helpfully. Be concise (2-3 sentences max). Use Swahili or English as appropriate. If you cannot answer, say you'll connect them with a human agent.`

    const reply = await gemini.generateContent(
      "You are a friendly, professional customer service agent for LUMARY Studio.",
      prompt,
    )
    if (reply) return reply
  }

  // Fallback: simple keyword-based responses
  const lower = message.toLowerCase()
  if (/\b(hello|hi|habari|mambo|vipi|hey|jambo)\b/.test(lower)) {
    return `Habari ${clientName}! Karibu LUMARY Studio. Ningekusaidiaje leo?`
  }
  if (/\b(bei|gharama|cost|price|pricing|how much)\b/.test(lower)) {
    return "Bei zetu ni kama ifuatavyo:\n• Brand Starter — 150,000 TSh\n• Social Media Pack — 120,000 TSh\n• CV Redesign — 10,000 TSh\n• Thumbnails — 5,000 TSh\n• Weekly Promo Pack — 80,000 TSh/mwezi\n\nJe, ungependa kujua zaidi kuhusu huduma yoyote?"
  }
  if (/\b(malipo|payment|lipa|pesa|mpesa)\b/.test(lower)) {
    return "Tunakubali malipo kwa M-PESA, Benki, na Cash. Unalipa 50% kuanza mradi, na 50% baada ya kukamilika."
  }
  if (/\b(iko wapi|status|progress|endelea|tayari|imesha)\b/.test(lower)) {
    return "Ngoja niangalie status ya mradi wako... nitarudi kwako hivi punde na taarifa kamili."
  }
  if (/\b(asante|thanks|thank you)\b/.test(lower)) {
    return "Asante sana! Tunafurahi kukusaidia. Kuna jambo lingine lolote?"
  }
  if (/\b(anwani|wapi|location|address|ofisi)\b/.test(lower)) {
    return "Ofisi zetu zipo Mwanza, Tanzania. P.O. Box 169. Unaweza kutupigia +255 65 136 0763 kwa maelekezo."
  }
  if (/\b(saa|masaa|hours|time|working|lini)\b/.test(lower)) {
    return "Saa zetu za kazi ni Jumatatu hadi Ijumaa 9AM-6PM, na Jumamosi 9AM-2PM. Siku ya Jumapili tunafunga."
  }

  return `Asante kwa ujumbe wako ${clientName}! Nimepokea swali lako na nitakujibu haraka iwezekanavyo.`
}
