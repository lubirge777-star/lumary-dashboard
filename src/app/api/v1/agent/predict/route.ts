import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { analyzePatterns } from "@/lib/gemini"

export async function GET(req: NextRequest) {
  try {
    // Gather cross-domain data for predictive analysis
    const [
      projects,
      payments,
      habits,
      goals,
      journalCount,
      timerSessions,
    ] = await Promise.all([
      prisma.project.findMany({ select: { status: true, updatedAt: true, createdAt: true, quotedAmount: true } }),
      prisma.payment.findMany({ select: { status: true, amount: true, createdAt: true } }),
      prisma.habitLog.findMany({ orderBy: { date: "desc" }, take: 30, select: { completed: true, date: true } }),
      prisma.goal.findMany({ select: { level: true } }),
      prisma.journalEntry.count(),
      prisma.timerSession.aggregate({ _sum: { duration: true } }),
    ])

    const stalledProjects = projects.filter((p) => {
      const updatedAt = (p as any).updatedAt ? new Date((p as any).updatedAt) : new Date(p.createdAt)
      const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / 86400000
      return daysSinceUpdate > 7 && !["PAID", "FINAL_DELIVERED", "CANCELLED"].includes(p.status)
    }).length
    const unpaidInvoices = payments.filter((p) => p.status !== "PAID").length
    const totalRevenue = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0)
    const habitsCompleted = habits.filter((h) => h.completed).length
    const activeGoals = goals.filter((g) => ["today", "week", "month"].includes(g.level)).length
    const totalMinutes = Math.floor((timerSessions._sum.duration || 0) / 60)

    const data = {
      business: {
        stalledProjects,
        unpaidInvoices,
        totalRevenue,
        projectCount: projects.length,
      },
      personal: {
        habitsLogged30d: habits.length,
        habitsCompleted30d: habitsCompleted,
        activeGoals,
        journalEntries: journalCount,
        timerMinutes: totalMinutes,
      },
    }

    const analysis = await analyzePatterns(data as Record<string, unknown>)

    if (!analysis) {
      return Response.json({ patterns: [], predictions: [], recommendations: [] })
    }

    return Response.json(analysis)
  } catch {
    return Response.json({ patterns: [], predictions: [], recommendations: [] })
  }
}
