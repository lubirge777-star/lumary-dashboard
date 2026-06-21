import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const financeTools: ToolDef[] = [
  {
    name: "query_payments",
    description: "List payments with filters by client, status, date range, or method.",
    parameters: {
      clientId: { type: "string", description: "Filter by client ID" },
      status: { type: "string", description: "Filter by status", enum: ["UNPAID", "FIFTY_PERCENT", "PAID", "OVERDUE", "REFUNDED"] },
      method: { type: "string", description: "Filter by method", enum: ["MPESA", "BANK", "CASH", "STRIPE", "OTHER"] },
      limit: { type: "number", description: "Max results (default 50)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.clientId) where.clientId = args.clientId as string
      if (args.status) where.status = args.status as string
      if (args.method) where.method = args.method as string
      const payments = await prisma.payment.findMany({
        where,
        include: { client: { select: { name: true, whatsappNumber: true } } },
        orderBy: { createdAt: "desc" },
        take: (args.limit as number) ?? 50,
      })
      return { success: true, data: payments }
    },
  },
  {
    name: "create_payment",
    description: "Record a payment received or invoice created.",
    parameters: {
      clientId: { type: "string", description: "Client ID", required: true },
      amount: { type: "number", description: "Amount in TSh", required: true },
      method: { type: "string", description: "Payment method", enum: ["MPESA", "BANK", "CASH", "STRIPE", "OTHER"] },
      status: { type: "string", description: "Payment status", enum: ["UNPAID", "FIFTY_PERCENT", "PAID", "OVERDUE", "REFUNDED"] },
      projectId: { type: "string", description: "Associated project ID (optional)" },
      notes: { type: "string", description: "Payment notes" },
    },
    handler: async (args) => {
      const payment = await prisma.payment.create({
        data: {
          clientId: args.clientId as string,
          amount: args.amount as number,
          method: (args.method as string) ?? "MPESA",
          status: (args.status as string) ?? "UNPAID",
          projectId: (args.projectId as string) ?? null,
          notes: (args.notes as string) ?? null,
          paidAt: (args.status as string) === "PAID" ? new Date() : null,
        },
      })
      return { success: true, data: payment }
    },
  },
  {
    name: "update_payment",
    description: "Update payment status, amount, or mark as paid.",
    parameters: {
      paymentId: { type: "string", description: "Payment ID", required: true },
      status: { type: "string", description: "New status", enum: ["UNPAID", "FIFTY_PERCENT", "PAID", "OVERDUE", "REFUNDED"] },
      amount: { type: "number", description: "Update amount" },
      notes: { type: "string", description: "Update notes" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.status) {
        data.status = args.status
        if (args.status === "PAID") data.paidAt = new Date()
      }
      if (args.amount !== undefined) data.amount = args.amount
      if (args.notes !== undefined) data.notes = args.notes
      const payment = await prisma.payment.update({ where: { id: args.paymentId as string }, data })
      return { success: true, data: payment }
    },
  },
  {
    name: "get_finance_summary",
    description: "Get monthly income, expenses, and profit summary.",
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
    name: "query_expenses",
    description: "List expenses with optional category filter.",
    parameters: {
      category: { type: "string", description: "Filter by category" },
      limit: { type: "number", description: "Max results (default 50)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.category) where.category = args.category as string
      const expenses = await prisma.expense.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: (args.limit as number) ?? 50,
      })
      return { success: true, data: expenses }
    },
  },
  {
    name: "create_expense",
    description: "Log a business expense.",
    parameters: {
      category: { type: "string", description: "Expense category", required: true },
      description: { type: "string", description: "What the expense was for", required: true },
      amount: { type: "number", description: "Amount in TSh", required: true },
    },
    handler: async (args) => {
      const expense = await prisma.expense.create({
        data: {
          category: args.category as string,
          description: args.description as string,
          amount: args.amount as number,
        },
      })
      return { success: true, data: expense }
    },
  },
  {
    name: "query_retainers",
    description: "List retainer agreements with client info.",
    parameters: {
      status: { type: "string", description: "Filter by status", enum: ["active", "paused", "cancelled"] },
      paymentStatus: { type: "string", description: "Filter by payment status", enum: ["paid", "unpaid"] },
      clientId: { type: "string", description: "Filter by client ID" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.status) where.status = args.status as string
      if (args.paymentStatus) where.paymentStatus = args.paymentStatus as string
      if (args.clientId) where.clientId = args.clientId as string
      const retainers = await prisma.retainer.findMany({
        where,
        include: { client: { select: { name: true, whatsappNumber: true } } },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: retainers }
    },
  },
  {
    name: "create_retainer",
    description: "Set up a retainer agreement for a client.",
    parameters: {
      clientId: { type: "string", description: "Client ID", required: true },
      monthlyValue: { type: "number", description: "Monthly retainer value in TSh", required: true },
      package: { type: "string", description: "Package type", enum: ["WHATSAPP_PACK", "SOCIAL_MEDIA_PACK", "WEEKLY_PROMO_PACK", "MONTHLY_STATUS_MARKETING", "CREATOR_MONTHLY", "BRAND_MANAGER", "CUSTOM"] },
      contentDueBy: { type: "string", description: "ISO date when content is due each month" },
      graphicsDue: { type: "number", description: "Number of graphics due per month" },
    },
    handler: async (args) => {
      const retainer = await prisma.retainer.create({
        data: {
          clientId: args.clientId as string,
          monthlyValue: args.monthlyValue as number,
          package: (args.package as string) ?? "CUSTOM",
          contentDueBy: args.contentDueBy ? new Date(args.contentDueBy as string) : new Date(),
          graphicsDue: (args.graphicsDue as number) ?? 12,
          status: "active",
        },
      })
      return { success: true, data: retainer }
    },
  },
  {
    name: "update_retainer",
    description: "Update retainer status, package, or delivery counts.",
    parameters: {
      retainerId: { type: "string", description: "Retainer ID", required: true },
      status: { type: "string", description: "New status", enum: ["active", "paused", "cancelled"] },
      paymentStatus: { type: "string", description: "Payment status", enum: ["paid", "unpaid"] },
      graphicsDelivered: { type: "number", description: "Update graphics delivered count" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.status) data.status = args.status
      if (args.paymentStatus) data.paymentStatus = args.paymentStatus
      if (args.graphicsDelivered !== undefined) data.graphicsDelivered = args.graphicsDelivered
      const retainer = await prisma.retainer.update({ where: { id: args.retainerId as string }, data })
      return { success: true, data: retainer }
    },
  },
]
