import { NextRequest, NextResponse } from "next/server"
import { generateContent } from "@/lib/gemini"
import { prisma } from "@/lib/prisma"
import type { AgentMessage } from "@/types"

const SYSTEM_PROMPT = `You are LUMARY's AI Agent — the executive assistant for a creative design studio in Tanzania.
You can read and modify any data in the dashboard. You have access to clients, projects, payments, expenses, retainers, messages, settings, and more.

Your capabilities:
1. Answer questions about any dashboard data (clients, projects, payments, etc.)
2. Execute commands to create, update, or delete data
3. Provide business insights and recommendations
4. Help draft messages to clients
5. Analyze project status and suggest next steps

When the user asks you to DO something (create a client, update a project, send a message, etc.), respond with a JSON block:
\`\`\`json
{
  "action": "createClient" | "updateClient" | "deleteClient" | "createProject" | "updateProjectStatus" |
           "createPayment" | "sendMessage" | "updateSettings" | "createAppointment" | "createExpense" |
           "getData" | "analyze" | "draftMessage",
  "params": { ... }
}
\`\`\`
Then execute it and confirm the result.

Keep responses concise, professional, and helpful. Use Swahili or English as appropriate.
You are based in Dar es Salaam and work with local businesses.`

async function executeAction(action: string, params: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    switch (action) {
      case "createClient": {
        const c = await prisma.client.create({ data: { ...params, createdAt: new Date(), updatedAt: new Date() } as any })
        return { success: true, data: c }
      }
      case "updateClient": {
        const { id, ...data } = params
        const c = await prisma.client.update({ where: { id }, data: { ...data, updatedAt: new Date() } as any })
        return { success: true, data: c }
      }
      case "deleteClient": {
        await prisma.client.delete({ where: { id: params.id } })
        return { success: true }
      }
      case "createProject": {
        const p = await prisma.project.create({ data: { ...params, createdAt: new Date(), updatedAt: new Date() } as any })
        return { success: true, data: p }
      }
      case "updateProjectStatus": {
        const p = await prisma.project.update({ where: { id: params.id }, data: { status: params.status } })
        return { success: true, data: p }
      }
      case "createPayment": {
        const pay = await prisma.payment.create({ data: { ...params, createdAt: new Date() } as any })
        return { success: true, data: pay }
      }
      case "sendMessage": {
        const msg = await prisma.message.create({ data: { ...params, createdAt: new Date() } as any })
        return { success: true, data: msg }
      }
      case "getData": {
        let data: any
        const model = params.model as string
        const where = params.where || {}
        const orderBy = params.orderBy || { createdAt: "desc" as const }
        const take = params.take || 10
        switch (model) {
          case "clients": data = await prisma.client.findMany({ where, orderBy, take }); break
          case "projects": data = await prisma.project.findMany({ where, orderBy, take }); break
          case "payments": data = await prisma.payment.findMany({ where, orderBy, take }); break
          case "expenses": data = await prisma.expense.findMany({ where, orderBy, take }); break
          case "activities": data = await prisma.activity.findMany({ where, orderBy, take }); break
          default: return { success: false, error: `Unknown model: ${model}` }
        }
        return { success: true, data }
      }
      default:
        return { success: false, error: `Unknown action: ${action}` }
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 })

    const historyText = history.map((m: AgentMessage) =>
      `${m.role === "agent" ? "Assistant" : "User"}: ${m.content}`
    ).join("\n")

    const userPrompt = historyText
      ? `Previous conversation:\n${historyText}\n\nUser: ${message}`
      : `User: ${message}`

    const aiResponse = await generateContent(SYSTEM_PROMPT, userPrompt)
    let reply = aiResponse || "Samahani, sijaweza kuchakata ombi lako kwa sasa."

    const jsonMatch = reply.match(/```json\n([\s\S]*?)\n```/)
    let actionResult: any = null

    if (jsonMatch) {
      try {
        const cmd = JSON.parse(jsonMatch[1])
        actionResult = await executeAction(cmd.action, cmd.params)
        const confirmMsg = actionResult.success
          ? `✅ **${cmd.action}** imefanikiwa!`
          : `❌ **${cmd.action}** imeshindwa: ${actionResult.error}`
        reply = reply.replace(jsonMatch[0], confirmMsg)
      } catch { }
    }

    return NextResponse.json({
      reply,
      actionResult,
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    console.error("Agent chat error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
