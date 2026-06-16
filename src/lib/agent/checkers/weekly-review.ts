import { prisma } from "@/lib/prisma"
import type { AgentNudgeInput } from "../types"

export async function check(): Promise<{ nudges: AgentNudgeInput[] }> {
  const nudges: AgentNudgeInput[] = []

  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysSinceMonday = (dayOfWeek + 6) % 7
  const currentWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday)
  currentWeekStart.setHours(0, 0, 0, 0)

  const latestReview = await prisma.weeklyReview.findFirst({
    orderBy: { weekStart: "desc" },
  })

  if (!latestReview || latestReview.weekStart < currentWeekStart) {
    if (latestReview) {
      const weeksSince = Math.floor(
        (currentWeekStart.getTime() - latestReview.weekStart.getTime()) / (7 * 86400000)
      )

      if (weeksSince >= 2) {
        nudges.push({
          type: "review",
          title: "Weekly review overdue",
          message: `Your last weekly review was ${weeksSince} weeks ago. Take 10 minutes to reflect.`,
          severity: "high",
        })
      } else {
        nudges.push({
          type: "review",
          title: "No weekly review yet",
          message: "You haven't completed a weekly review this week. Set aside time to reflect.",
          severity: "low",
        })
      }
    } else {
      nudges.push({
        type: "review",
        title: "No weekly review yet",
        message: "You haven't completed a weekly review this week. Set aside time to reflect.",
        severity: "low",
      })
    }
  }

  if (latestReview) {
    const lowEnergy = latestReview.energy != null && latestReview.energy < 4
    const lowFocus = latestReview.focus != null && latestReview.focus < 4
    if (lowEnergy || lowFocus) {
      nudges.push({
        type: "review",
        title: "Last week was tough",
        message: "Your last review showed low energy or focus. How are you feeling today?",
        severity: "low",
      })
    }
  }

  return { nudges }
}
