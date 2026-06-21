import { prisma } from "@/lib/prisma"
import { sendWhatsApp } from "@/lib/whatsapp"

export type ToolParam = string | number | boolean | string[] | undefined

export interface ToolDef {
  name: string
  description: string
  parameters: Record<string, { type: string; description: string; required?: boolean; enum?: string[] }>
  handler: (args: Record<string, ToolParam>) => Promise<{ success: boolean; data?: any; error?: string }>
}

export const tools: ToolDef[] = [
  {
    name: "create_reminder",
    description: "Create a reminder for Lubirge. Shows in the dashboard notification bell.",
    parameters: {
      title: { type: "string", description: "Reminder title (what to remember)", required: true },
      context: { type: "string", description: "Optional context or details about the reminder" },
      priority: { type: "string", description: "Priority level", enum: ["high", "medium", "low"] },
      dueAt: { type: "string", description: "ISO date when this reminder is due" },
    },
    handler: async (args) => {
      const reminder = await prisma.reminder.create({
        data: {
          title: args.title as string,
          context: (args.context as string) ?? null,
          priority: (args.priority as string) ?? "medium",
          dueAt: args.dueAt ? new Date(args.dueAt as string) : null,
        },
      })
      return { success: true, data: reminder }
    },
  },
  {
    name: "dismiss_reminder",
    description: "Mark a reminder as dismissed.",
    parameters: {
      id: { type: "string", description: "Reminder ID to dismiss", required: true },
    },
    handler: async (args) => {
      await prisma.reminder.update({ where: { id: args.id as string }, data: { dismissed: true } })
      return { success: true }
    },
  },
  {
    name: "list_reminders",
    description: "List all active (undismissed) reminders.",
    parameters: {},
    handler: async () => {
      const reminders = await prisma.reminder.findMany({
        where: { dismissed: false },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: reminders }
    },
  },
  {
    name: "send_whatsapp",
    description: "Send a WhatsApp message to a client by their phone number.",
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
    name: "query_clients",
    description: "Search clients by name, status, or service type.",
    parameters: {
      query: { type: "string", description: "Search term (name, service, or status)" },
      status: { type: "string", description: "Filter by status", enum: ["ACTIVE", "RETAINER", "DORMANT", "CHURNED"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.query) {
        where.OR = [
          { name: { contains: args.query as string, mode: "insensitive" } },
          { servicesUsed: { has: args.query as string } },
          { businessType: { contains: args.query as string, mode: "insensitive" } },
        ]
      }
      if (args.status) where.status = args.status as string
      const clients = await prisma.client.findMany({ where, orderBy: { createdAt: "desc" }, take: 20 })
      return { success: true, data: clients }
    },
  },
  {
    name: "create_client",
    description: "Create a new client record.",
    parameters: {
      name: { type: "string", description: "Client name", required: true },
      whatsappNumber: { type: "string", description: "WhatsApp phone number", required: true },
      email: { type: "string", description: "Email address" },
      businessType: { type: "string", description: "Type of business" },
      location: { type: "string", description: "Location/area" },
      notes: { type: "string", description: "Initial notes about the client" },
    },
    handler: async (args) => {
      const client = await prisma.client.create({
        data: {
          name: args.name as string,
          whatsappNumber: args.whatsappNumber as string,
          email: (args.email as string) ?? null,
          businessType: (args.businessType as string) ?? null,
          location: (args.location as string) ?? null,
          notes: (args.notes as string) ?? null,
        },
      })
      return { success: true, data: client }
    },
  },
  {
    name: "query_projects",
    description: "Search projects by status, client, or service type.",
    parameters: {
      status: { type: "string", description: "Filter by status", enum: ["NEW_INQUIRY", "QUOTED", "DEPOSIT_PAID", "IN_PROGRESS", "REVISION", "FINAL_DELIVERED", "PAID"] },
      clientId: { type: "string", description: "Filter by client ID" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.status) where.status = args.status as string
      if (args.clientId) where.clientId = args.clientId as string
      const projects = await prisma.project.findMany({
        where,
        include: { client: { select: { name: true, whatsappNumber: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
      return { success: true, data: projects }
    },
  },
  {
    name: "get_metrics",
    description: "Get current dashboard metrics (revenue, active clients, projects, pending payments).",
    parameters: {},
    handler: async () => {
      const [clients, projects, payments, retainers] = await Promise.all([
        prisma.client.count(),
        prisma.project.count(),
        prisma.payment.findMany({ where: { status: "UNPAID" }, select: { amount: true } }),
        prisma.retainer.count({ where: { paymentStatus: "unpaid" } }),
      ])
      const unpaidTotal = payments.reduce((sum, p) => sum + p.amount, 0)
      return {
        success: true,
        data: {
          totalClients: clients,
          activeProjects: projects,
          unpaidInvoices: payments.length,
          unpaidTotal,
          unpaidRetainers: retainers,
        },
      }
    },
  },
  {
    name: "get_finance_summary",
    description: "Get financial summary including monthly income, expenses, and P&L.",
    parameters: {},
    handler: async () => {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const [payments, expenses] = await Promise.all([
        prisma.payment.findMany({ where: { paidAt: { gte: monthStart } }, select: { amount: true } }),
        prisma.expense.findMany({ where: { createdAt: { gte: monthStart } }, select: { amount: true } }),
      ])
      const income = payments.reduce((s, p) => s + p.amount, 0)
      const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0)
      return { success: true, data: { income, expenses: expenseTotal, profit: income - expenseTotal } }
    },
  },
  {
    name: "query_goals",
    description: "Get today's goals and focus items.",
    parameters: {},
    handler: async () => {
      const goals = await prisma.goal.findMany({
        where: { level: "today" },
        orderBy: { sortOrder: "asc" },
      })
      return { success: true, data: goals }
    },
  },
  {
    name: "create_activity",
    description: "Log an activity entry in the dashboard feed.",
    parameters: {
      type: { type: "string", description: "Activity type (e.g. NOTE_ADDED, PROJECT_CREATED, PAYMENT_RECEIVED)", required: true },
      targetType: { type: "string", description: "Target type (client, project, settings, etc.)", required: true },
      targetId: { type: "string", description: "Target record ID", required: true },
      description: { type: "string", description: "Description of the activity" },
    },
    handler: async (args) => {
      const activity = await prisma.activity.create({
        data: {
          type: args.type as string,
          actorName: "Hermes",
          targetType: args.targetType as string,
          targetId: args.targetId as string,
          meta: { source: "hermes_agent", description: (args.description as string) ?? "" },
        },
      })
      return { success: true, data: activity }
    },
  },
]

export function getToolDefs() {
  return tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(t.parameters).map(([k, v]) => [
            k,
            { type: v.type, description: v.description, ...(v.enum ? { enum: v.enum } : {}) },
          ])
        ),
        required: Object.entries(t.parameters).filter(([, v]) => v.required).map(([k]) => k),
      },
    },
  }))
}

export async function executeTool(name: string, args: Record<string, ToolParam>) {
  const tool = tools.find((t) => t.name === name)
  if (!tool) return { success: false, error: `Unknown tool: ${name}` }
  try {
    return await tool.handler(args)
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
