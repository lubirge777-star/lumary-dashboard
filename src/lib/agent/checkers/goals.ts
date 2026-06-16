import { prisma } from "@/lib/prisma"
import type { AgentNudgeInput } from "../types"

export async function check(): Promise<{ nudges: AgentNudgeInput[] }> {
  const nudges: AgentNudgeInput[] = []

  const monthGoals = await prisma.goal.findMany({ where: { level: "month" } })
  const weekGoals = await prisma.goal.findMany({ where: { level: "week" } })
  const todayGoals = await prisma.goal.findMany({ where: { level: "today" } })

  if (todayGoals.length === 0 && monthGoals.length > 0) {
    nudges.push({
      type: "goal",
      title: "Set today's goals",
      message: "You have monthly goals but no goals set for today. Break them down into daily tasks.",
      severity: "low",
    })
  }

  if (monthGoals.length > 0) {
    const monthIds = monthGoals.map(g => g.id)
    const weekWithParents = weekGoals.filter(w => w.parentId && monthIds.includes(w.parentId))
    if (weekWithParents.length === 0) {
      nudges.push({
        type: "goal",
        title: "Break down month goals",
        message: "Your monthly goals don't have any weekly goals yet. Add week-level breakdowns.",
        severity: "low",
      })
    }
  }

  if (weekGoals.length > 0) {
    const weekIds = weekGoals.map(g => g.id)
    const todayWithParents = todayGoals.filter(t => t.parentId && weekIds.includes(t.parentId))
    if (todayWithParents.length === 0) {
      nudges.push({
        type: "goal",
        title: "Set today's tasks",
        message: "You have weekly goals but no daily goals tied to them. Add today-level tasks.",
        severity: "medium",
      })
    }
  }

  return { nudges }
}
