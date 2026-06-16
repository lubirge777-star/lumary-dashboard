import { prisma } from "@/lib/prisma"
import { generateContent } from "@/lib/gemini"
import type { AgentNudgeInput } from "./types"

export async function generateCrossDomainInsights(): Promise<AgentNudgeInput[]> {
  const nudges: AgentNudgeInput[] = []

  try {
    const [habitsToday, focusToday, weekAvg, unpaidCount, activeProjects, lastReview, journalEntry] = await Promise.all([
      getHabitSummary(),
      getFocusToday(),
      getFocusWeekAvg(),
      getUnpaidCount(),
      getActiveProjectCount(),
      getLastReview(),
      getLatestJournal(),
    ])

    const patterns: string[] = []
    if (habitsToday.done < habitsToday.total * 0.5) patterns.push("less than half of habits done")
    if (focusToday < 30) patterns.push("very low focus today")
    if (unpaidCount > 2) patterns.push(`${unpaidCount} unpaid payments`)
    if (activeProjects > 4) patterns.push(`${activeProjects} active projects`)
    if (lastReview?.energy && lastReview.energy < 4) patterns.push("low energy last week")
    if (lastReview?.focus && lastReview.focus < 4) patterns.push("low focus last week")

    if (habitsToday.done === 0 && focusToday === 0) {
      nudges.push({
        type: "cross_domain",
        title: "Day hasn't started",
        message: "No habits logged and no focus time yet. Start with one small win — even 5 minutes counts.",
        severity: "medium",
        category: "morning-routine",
        metadata: { habitsDone: 0, focusMinutes: 0 },
      })
    }

    if (patterns.length >= 2) {
      const patternSummary = patterns.join(", ")
      nudges.push({
        type: "cross_domain",
        title: "Pattern detected",
        message: `Multiple signals: ${patternSummary}. Consider a lighter day or focused recovery session.`,
        severity: "medium",
        category: "pattern-alert",
        metadata: { patterns, habitsDone: habitsToday.done, focusMinutes: focusToday, unpaidCount, activeProjects },
      })
    }

    if (journalEntry) {
      const moodKeywords = ["tired", "stressed", "overwhelmed", "burnout", "sick", "exhausted", "anxious"]
      const lower = journalEntry.content.toLowerCase()
      const found = moodKeywords.filter((k) => lower.includes(k))
      if (found.length > 0 && habitsToday.done < habitsToday.total * 0.7) {
        nudges.push({
          type: "cross_domain",
          title: "Check-in needed",
          message: `Your latest journal mentions "${found.join(", ")}" and habits are lagging. Be kind to yourself today.`,
          severity: "medium",
          category: "wellness",
          metadata: { moodKeywords: found, habitsDone: habitsToday.done },
        })
      }
    }

    if (patterns.length >= 3) {
      const data = {
        date: new Date().toISOString().slice(0, 10),
        habitsDone: habitsToday.done,
        habitsTotal: habitsToday.total,
        focusMinutes: focusToday,
        weekAvgFocus: Math.round(weekAvg),
        unpaidCount,
        activeProjects,
        journalPreview: journalEntry?.content?.slice(0, 200),
      }

      const aiResponse = await generateContent(
        `You are a personal coach assistant. Analyze this daily snapshot and write ONE empathetic, actionable sentence.
Current date: ${data.date}
Habits: ${data.habitsDone}/${data.habitsTotal}
Focus: ${data.focusMinutes}min (avg ${data.weekAvgFocus}min)
Unpaid payments: ${data.unpaidCount}
Active projects: ${data.activeProjects}
Journal preview: ${data.journalPreview || "none"}
Respond with exactly ONE sentence, no prefixes, no labels, no quotes.`,
        "What's your coaching insight for today?"
      )

      if (aiResponse) {
        nudges.push({
          type: "cross_domain",
          title: "Coach insight",
          message: aiResponse.trim(),
          severity: "low",
          category: "ai-coach",
          metadata: { data },
        })
      }
    }
  } catch (e) {
    console.error("cross-domain insights error:", e)
  }

  return nudges
}

async function getHabitSummary(): Promise<{ done: number; total: number }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 86400000)

  const [habits, logs] = await Promise.all([
    prisma.habit.findMany({ where: { isActive: true } }),
    prisma.habitLog.findMany({
      where: { date: { gte: today, lt: tomorrow }, completed: true },
    }),
  ])

  return { done: logs.length, total: habits.length }
}

async function getFocusToday(): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 86400000)

  const sessions = await prisma.timerSession.findMany({
    where: { createdAt: { gte: today, lt: tomorrow }, completed: true },
  })

  return sessions.reduce((sum, s) => sum + s.duration, 0)
}

async function getFocusWeekAvg(): Promise<number> {
  const weekAgo = new Date(Date.now() - 7 * 86400000)
  const sessions = await prisma.timerSession.findMany({
    where: { createdAt: { gte: weekAgo }, completed: true },
  })

  const byDay: Record<string, number> = {}
  for (const s of sessions) {
    const d = s.createdAt.toISOString().slice(0, 10)
    byDay[d] = (byDay[d] || 0) + s.duration
  }

  const days = Object.keys(byDay)
  return days.length ? Math.round(Object.values(byDay).reduce((a, b) => a + b, 0) / days.length) : 0
}

async function getUnpaidCount(): Promise<number> {
  return prisma.payment.count({ where: { status: { in: ["UNPAID", "OVERDUE"] } } })
}

async function getActiveProjectCount(): Promise<number> {
  return prisma.project.count({ where: { status: { in: ["IN_PROGRESS", "REVISION", "DEPOSIT_PAID"] } } })
}

async function getLastReview() {
  return prisma.weeklyReview.findFirst({ orderBy: { weekStart: "desc" } })
}

async function getLatestJournal() {
  return prisma.journalEntry.findFirst({ orderBy: { createdAt: "desc" } })
}
