import type { Client, Project, DailyDigest } from "@/types"
import * as gemini from "@/lib/gemini"

type Intent = "quote_request" | "status_check" | "complaint" | "payment_question" | "general_inquiry" | "order_update" | "greeting" | "unknown"

const intentPatterns: Record<string, RegExp[]> = {
  quote_request: [/bei gani/i, /gharama/i, /cost/i, /how much/i, /quote/i, /price/i, /pricing/i, /estimate/i, /nakubali\?/i, /tuambie bei/i],
  status_check: [/iko wapi/i, /progress/i, /status/i, /endelea/i, /finished/i, /complete/i, /tayari/i, /imesha/i, /wapi mradi/i],
  complaint: [/tatizo/i, /shida/i, /complaint/i, /not happy/i, /dissatisfied/i, /mbaya/i, /kosea/i, /haribu/i, /samemfanya/i],
  payment_question: [/malipo/i, /payment/i, /lipa/i, /balance/i, /deni/i, /pesa/i, /invoice/i, /baki/i, /sijalipa/i],
  order_update: [/order/i, /nimeamua/i, /nataka/i, /nunua/i, /new project/i, /naomba/i, /taka kuanza/i],
  greeting: [/hello/i, /hi/i, /habari/i, /mambo/i, /vipi/i, /hey/i, /hujambo/i, /sasa/i, /jambo/i],
  general_inquiry: [],
  unknown: [],
}

function detectIntentFallback(text: string): { intent: Intent; confidence: number } {
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return { intent: intent as Intent, confidence: 0.8 }
      }
    }
  }
  return { intent: "unknown", confidence: 0.3 }
}

function fallbackReply(intent: Intent, clientName?: string): string {
  switch (intent) {
    case "greeting":
      return `Habari ${clientName || "Mteja"}! Karibu LUMARY Studio. Ningekusaidiaje leo?`
    case "quote_request":
      return `Asante kwa kuuliza ${clientName || ""}! Ninaweza kukupa quote kwa huduma zetu. Je, una nia ya huduma gani? (Brand Starter, Social Media Pack, CV Redesign, Thumbnails)`
    case "status_check":
      return `Ngoja niangalie status ya mradi wako...`
    case "payment_question":
      return `Kwa malipo, tunakubali M-PESA, Benki, au Cash. Je, ungependa kulipa sasa?`
    case "complaint":
      return `Samahani kwa usumbufu ${clientName || ""}! Tafadhali nieleze zaidi ili niweze kutatua tatizo lako haraka iwezekanavyo.`
    default:
      return `Asante kwa ujumbe wako ${clientName || ""}! Nitarudi kwako hivi karibuni.`
  }
}

const intentLabels: Record<string, string> = {
  quote_request: "Quote Request",
  status_check: "Status Check",
  complaint: "Complaint",
  payment_question: "Payment Question",
  order_update: "Order Update",
  greeting: "Greeting",
  general_inquiry: "General Inquiry",
  unknown: "Unknown",
}

function label(intent: string): string {
  return intentLabels[intent] || "Unknown"
}

export async function analyzeMessage(text: string, clientName?: string) {
  if (await gemini.isAvailable()) {
    const result = await gemini.classifyIntent(text)
    if (result) {
      return {
        intent: label(result.intent),
        intentKey: result.intent,
        confidence: result.confidence,
        suggestedReply: result.suggestedReply,
      }
    }
  }

  const { intent, confidence } = detectIntentFallback(text)
  return {
    intent: label(intent),
    intentKey: intent,
    confidence,
    suggestedReply: fallbackReply(intent, clientName),
  }
}

export async function generateQuote(clientName: string, serviceType: string, description: string) {
  if (await gemini.isAvailable()) {
    const result = await gemini.generateQuote(serviceType, description)
    if (result) {
      return {
        clientName,
        serviceType,
        description,
        basePrice: result.basePrice,
        recommendedPrice: result.recommendedPrice,
        paymentOptions: [
          { type: "Full Payment", amount: result.recommendedPrice },
          { type: "50% Deposit", amount: Math.round(result.recommendedPrice * 0.5) },
        ],
      }
    }
  }

  const basePrices: Record<string, number> = {
    "Brand Starter": 150000,
    "Social Media Pack": 120000,
    "CV Redesign": 10000,
    "Thumbnails": 5000,
    "Weekly Promo Pack": 80000,
  }
  const basePrice = basePrices[serviceType] || 50000
  const complexityMultiplier = description.length > 100 ? 1.5 : 1
  const recommendedPrice = Math.round(basePrice * complexityMultiplier)

  return {
    clientName,
    serviceType,
    description,
    basePrice,
    recommendedPrice,
    paymentOptions: [
      { type: "Full Payment", amount: recommendedPrice },
      { type: "50% Deposit", amount: Math.round(recommendedPrice * 0.5) },
    ],
  }
}

export async function generateWeeklyDigest(clients: Client[], projects: Project[]): Promise<DailyDigest> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const activeProjects = projects.filter((p) =>
    ["NEW_INQUIRY", "QUOTED", "DEPOSIT_PAID", "IN_PROGRESS", "REVISION"].includes(p.status)
  )
  const stalledProjects = projects.filter((p) => {
    if (!["IN_PROGRESS", "REVISION"].includes(p.status)) return false
    return new Date(p.createdAt) < weekAgo
  })
  const newClients = clients.filter((c) => new Date(c.createdAt) >= weekAgo)

  const summary = `LUMARY Studio weekly summary:
- ${activeProjects.length} active projects
- ${stalledProjects.length} stalled projects
- ${newClients.length} new clients
- ${projects.filter(p => p.status === "DEPOSIT_PAID" || p.status === "FINAL_DELIVERED").length} pending invoices
- Total unpaid: TSh ${projects.reduce((s, p) => s + (p.status !== "PAID" ? p.quotedAmount : 0), 0)}
- Total revenue (paid): TSh ${projects.filter(p => p.status === "PAID").reduce((s, p) => s + p.quotedAmount, 0)}`

  if (await gemini.isAvailable()) {
    const result = await gemini.generateDigest(summary)
    if (result) {
      return {
        date: now.toISOString(),
        pendingInvoices: projects.filter((p) => p.status === "DEPOSIT_PAID" || p.status === "FINAL_DELIVERED").length,
        unpaidAmount: projects.reduce((sum, p) => sum + (p.status !== "PAID" ? p.quotedAmount : 0), 0),
        activeProjects: activeProjects.length,
        stalledProjects: stalledProjects.length,
        dueRetainers: 0,
        newClients: newClients.length,
        totalRevenue: projects.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.quotedAmount, 0),
        totalExpenses: 0,
        topRecommendations: result.recommendations,
      }
    }
  }

  const recommendations: string[] = []
  if (stalledProjects.length > 0) recommendations.push(`${stalledProjects.length} project(s) stalled — send follow-up`)
  if (newClients.length > 0) recommendations.push(`${newClients.length} new client(s) — send welcome message`)
  if (stalledProjects.length > 3) recommendations.push("High backlog — consider reassigning projects")

  return {
    date: now.toISOString(),
    pendingInvoices: projects.filter((p) => p.status === "DEPOSIT_PAID" || p.status === "FINAL_DELIVERED").length,
    unpaidAmount: projects.reduce((sum, p) => sum + (p.status !== "PAID" ? p.quotedAmount : 0), 0),
    activeProjects: activeProjects.length,
    stalledProjects: stalledProjects.length,
    dueRetainers: 0,
    newClients: newClients.length,
    totalRevenue: projects.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.quotedAmount, 0),
    totalExpenses: 0,
    topRecommendations: recommendations,
  }
}

export async function detectChurnRisk(client: Client, projects: Project[]) {
  if (await gemini.isAvailable()) {
    const info = `Name: ${client.name}, Status: ${client.status}, Total spent: ${client.totalSpent}, Last project: ${client.lastProjectDate || "never"}, Notes: ${client.notes || "none"}`
    const result = await gemini.detectChurnRisk(info)
    if (result) return result
  }

  const reasons: string[] = []
  const now = new Date()
  const monthsSinceLastProject = client.lastProjectDate
    ? (now.getTime() - new Date(client.lastProjectDate).getTime()) / (30 * 24 * 60 * 60 * 1000)
    : 99

  if (monthsSinceLastProject > 6) reasons.push(`No project in ${Math.round(monthsSinceLastProject)} months`)
  if (client.totalSpent === 0) reasons.push("Client has never paid")
  if (monthsSinceLastProject > 3 && monthsSinceLastProject <= 6) reasons.push("No activity in 3-6 months")
  if (client.status === "DORMANT") reasons.push("Marked as dormant")

  const risk: "low" | "medium" | "high" =
    reasons.length === 0 ? "low" : reasons.length <= 1 ? "medium" : "high"

  return { risk, reasons }
}

export async function getSuggestedActions(client: Client, intent: string) {
  if (await gemini.isAvailable()) {
    const info = `Name: ${client.name}, Status: ${client.status}, Total spent: ${client.totalSpent}, Notes: ${client.notes || "none"}`
    const result = await gemini.generateSuggestedActions(info, intent)
    if (result) return result
  }

  const suggestions: string[] = []
  switch (intent) {
    case "quote_request":
      suggestions.push("Create a new project quote", "Send pricing catalog", "Schedule a call")
      break
    case "complaint":
      suggestions.push("Escalate to senior agent", "Offer discount on next project", "Schedule follow-up in 24h")
      break
    case "payment_question":
      suggestions.push("Check payment history", "Send payment link", "Check for overdue invoices")
      break
    case "status_check":
      suggestions.push("Check latest project status", "Send progress update", "Share delivery timeline")
      break
    default:
      if (client.status === "DORMANT") suggestions.push("Send re-engagement message", "Offer special discount")
      if (client.notes) suggestions.push(`Review client notes: ${client.notes.substring(0, 50)}`)
  }
  return suggestions
}
