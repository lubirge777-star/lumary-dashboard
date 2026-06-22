import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 86400000)

    const [
      goals,
      habitLogs,
      habits,
      timerSessions,
      payments,
      projects,
      weeklyReview,
      userConfigs,
    ] = await Promise.all([
      prisma.goal.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.habitLog.findMany({ where: { date: { gte: todayStart, lt: todayEnd } } }),
      prisma.habit.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.timerSession.findMany({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
      prisma.payment.findMany({ where: { status: { in: ["UNPAID", "OVERDUE"] } }, include: { client: true }, orderBy: { createdAt: "asc" } }),
      prisma.project.findMany({ where: { status: { in: ["NEW_INQUIRY", "QUOTED", "IN_PROGRESS"] } }, include: { client: true }, orderBy: { updatedAt: "desc" } }),
      prisma.weeklyReview.findFirst({ orderBy: { weekStart: "desc" } }),
      prisma.userConfig.findMany(),
    ])

    const configMap: Record<string, string> = {}
    for (const c of userConfigs) configMap[c.key] = c.value

    const todayGoals = goals.filter((g) => g.level === "today")
    const todayHabits = habits.map((h) => ({
      ...h,
      done: habitLogs.some((l) => l.habitId === h.id),
    }))

    const totalFocusMinutes = timerSessions
      .filter((s) => s.mode === "focus" && s.completed)
      .reduce((sum, s) => sum + s.duration, 0)

    const hour = now.getHours()
    const mode = hour < 14 ? "morning" : hour < 18 ? "afternoon" : "evening"

    return NextResponse.json({
      date: todayStart.toISOString(),
      mode,
      mission: configMap.mission || null,
      vision: configMap.vision || null,
      coreValues: configMap.core_values || null,
      goals: {
        today: todayGoals,
        fullCascade: goals,
      },
      habits: {
        items: todayHabits,
        doneCount: habitLogs.length,
        totalCount: habits.length,
      },
      focus: {
        totalMinutes: totalFocusMinutes,
        sessionsCount: timerSessions.length,
      },
      upcoming: {
        unpaidPayments: payments.map((p) => ({
          id: p.id,
          clientName: p.client.name,
          amount: p.amount,
          createdAt: p.createdAt,
          status: p.status,
        })),
        activeProjects: projects.map((p) => ({
          id: p.id,
          title: p.serviceType,
          clientName: p.client.name,
          status: p.status,
        })),
      },
      weeklyReview: weeklyReview
        ? { weekStart: weeklyReview.weekStart, wins: weeklyReview.wins }
        : null,
    })
  } catch (e) {
    console.error("Failed to fetch today briefing:", e)
    return NextResponse.json({ error: "Failed to load briefing" }, { status: 500 })
  }
}
