import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const dashboardTools: ToolDef[] = [
  {
    name: "get_dashboard_metrics",
    description: "Get live KPIs: total/revenue, client/project counts, unpaid totals.",
    parameters: {},
    handler: async () => {
      const [clientCount, projectCount, unpaidPayments, activeRetainers, unpaidRetainers] = await Promise.all([
        prisma.client.count(),
        prisma.project.count(),
        prisma.payment.findMany({ where: { status: "UNPAID" }, select: { amount: true } }),
        prisma.retainer.count({ where: { status: "active" } }),
        prisma.retainer.count({ where: { paymentStatus: "unpaid" } }),
      ])
      const unpaidTotal = unpaidPayments.reduce((s, p) => s + p.amount, 0)
      return {
        success: true,
        data: { clients: clientCount, projects: projectCount, unpaidInvoices: unpaidPayments.length, unpaidTotal, activeRetainers, unpaidRetainers },
      }
    },
  },
  {
    name: "get_activity_feed",
    description: "Get the most recent activity entries from the dashboard feed.",
    parameters: {
      limit: { type: "number", description: "How many entries to return (default 20)" },
    },
    handler: async (args) => {
      const activities = await prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: (args.limit as number) ?? 20,
      })
      return { success: true, data: activities }
    },
  },
  {
    name: "get_today_briefing",
    description: "Get a full today briefing with habits, goals, focus, upcoming payments and projects.",
    parameters: {},
    handler: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const [habits, habitLogs, goals, payments, projects, timerSessions] = await Promise.all([
        prisma.habit.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
        prisma.habitLog.findMany({ where: { date: { gte: today } }, select: { habitId: true, completed: true } }),
        prisma.goal.findMany({ where: { level: "today" }, orderBy: { sortOrder: "asc" } }),
        prisma.payment.findMany({ where: { status: "UNPAID" }, include: { client: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
        prisma.project.findMany({ where: { status: { not: "PAID" } }, include: { client: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
        prisma.timerSession.aggregate({ where: { createdAt: { gte: today } }, _sum: { duration: true }, _count: { id: true } }),
      ])
      const doneMap = new Map(habitLogs.filter((l) => l.completed).map((l) => [l.habitId, true]))
      return {
        success: true,
        data: {
          habits: { items: habits.map((h) => ({ id: h.id, name: h.name, icon: h.icon, done: doneMap.has(h.id) })), doneCount: doneMap.size, totalCount: habits.length },
          goals: { today: goals },
          focus: { totalMinutes: timerSessions._sum.duration ?? 0, sessionsCount: timerSessions._count.id },
          upcoming: {
            unpaidPayments: payments.map((p) => ({ id: p.id, clientName: p.client.name, amount: p.amount, createdAt: p.createdAt })),
            activeProjects: projects.map((p) => ({ id: p.id, title: p.serviceType, clientName: p.client.name, status: p.status })),
          },
        },
      }
    },
  },
]
