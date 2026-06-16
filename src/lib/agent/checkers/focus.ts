import { prisma } from "@/lib/prisma"
import type { AgentNudgeInput } from "../types"

export async function check(): Promise<{ nudges: AgentNudgeInput[] }> {
  const nudges: AgentNudgeInput[] = []

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  const todayResult = await prisma.timerSession.aggregate({
    _sum: { duration: true },
    where: { createdAt: { gte: todayStart, lt: todayEnd }, completed: true },
  })

  const todayMinutes = todayResult._sum.duration ?? 0

  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 86400000)
  const weekResult = await prisma.timerSession.aggregate({
    _sum: { duration: true },
    where: { createdAt: { gte: sevenDaysAgo, lt: todayEnd }, completed: true },
  })

  const weekMinutes = weekResult._sum.duration ?? 0
  const dailyAvg = weekMinutes / 7

  if (todayMinutes < 25) {
    nudges.push({
      type: "focus",
      title: "Start a focus session",
      message: "You've focused less than 25 minutes today. Start a Pomodoro session.",
      severity: "low",
    })
  }

  const hour = now.getHours()
  if (todayMinutes < 60 && hour >= 14) {
    nudges.push({
      type: "focus",
      title: "Focus time low",
      message: "You've focused less than 60 minutes today and it's already afternoon. Try a deep work block.",
      severity: "medium",
    })
  }

  if (dailyAvg > 0 && todayMinutes < dailyAvg * 0.3) {
    nudges.push({
      type: "focus",
      title: "Focus is way down today",
      message: `Your focus today (${Math.round(todayMinutes)} min) is less than 30% of your weekly average (${Math.round(dailyAvg)} min).`,
      severity: "high",
    })
  }

  return { nudges }
}
