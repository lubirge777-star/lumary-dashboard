import { prisma } from "@/lib/prisma"
import type { AgentNudgeInput } from "../types"

export async function check(): Promise<{ nudges: AgentNudgeInput[] }> {
  const nudges: AgentNudgeInput[] = []

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  const totalHabits = await prisma.habit.count({ where: { isActive: true } })
  if (totalHabits === 0) return { nudges }

  const todayLogs = await prisma.habitLog.findMany({
    where: { date: { gte: todayStart, lt: todayEnd } },
  })

  const todayCompletedCount = todayLogs.filter(l => l.completed).length
  const todayUndone = totalHabits - todayCompletedCount
  const todayCompletedHabitIds = todayLogs.filter(l => l.completed).map(l => l.habitId)

  const hour = now.getHours()
  if (hour >= 18 && todayUndone > 0) {
    nudges.push({
      type: "habit",
      title: "Evening habits pending",
      message: `You have ${todayUndone} habit${todayUndone > 1 ? "s" : ""} left to do this evening.`,
      severity: "medium",
    })
  }

  const yesterdayStart = new Date(todayStart.getTime() - 86400000)
  const yesterdayEnd = new Date(todayStart.getTime())

  const yesterdayLogs = await prisma.habitLog.findMany({
    where: { date: { gte: yesterdayStart, lt: yesterdayEnd }, completed: true },
  })

  const brokenHabitIds = yesterdayLogs
    .map(l => l.habitId)
    .filter(id => !todayCompletedHabitIds.includes(id))

  if (brokenHabitIds.length > 0) {
    const brokenHabits = await prisma.habit.findMany({
      where: { id: { in: brokenHabitIds } },
    })

    for (const habit of brokenHabits) {
      nudges.push({
        type: "habit",
        title: "Streak broken",
        message: `You completed "${habit.name}" yesterday but haven't logged it today.`,
        severity: "medium",
        metadata: { habitId: habit.id },
      })
    }
  }

  const activeHabits = await prisma.habit.findMany({ where: { isActive: true } })
  const activeHabitIds = activeHabits.map(h => h.id)

  const allCompletedLogs = await prisma.habitLog.findMany({
    where: { habitId: { in: activeHabitIds }, completed: true },
    orderBy: { date: "desc" },
  })

  const lastCompletedMap = new Map<string, Date>()
  for (const log of allCompletedLogs) {
    if (!lastCompletedMap.has(log.habitId)) {
      lastCompletedMap.set(log.habitId, log.date)
    }
  }

  for (const habit of activeHabits) {
    const lastDate = lastCompletedMap.get(habit.id)
    if (lastDate) {
      const daysSince = Math.floor((todayStart.getTime() - lastDate.getTime()) / 86400000)
      if (daysSince >= 3) {
        nudges.push({
          type: "habit",
          title: "Habit streak at risk",
          message: `You've missed "${habit.name}" for ${daysSince} consecutive days.`,
          severity: "high",
          metadata: { habitId: habit.id },
        })
      }
    }
  }

  return { nudges }
}
