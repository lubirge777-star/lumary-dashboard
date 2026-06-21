import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const personalTools: ToolDef[] = [
  {
    name: "query_goals",
    description: "Get goals filtered by level (dream, year10, year, quarter, month, week, today).",
    parameters: {
      level: { type: "string", description: "Goal level", enum: ["dream", "year10", "year", "quarter", "month", "week", "today"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.level) where.level = args.level as string
      const goals = await prisma.goal.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        include: { children: true },
      })
      return { success: true, data: goals }
    },
  },
  {
    name: "create_goal",
    description: "Create a new goal at any level.",
    parameters: {
      level: { type: "string", description: "Goal level", enum: ["dream", "year10", "year", "quarter", "month", "week", "today"], required: true },
      title: { type: "string", description: "Goal title", required: true },
      description: { type: "string", description: "Detailed description" },
      parentId: { type: "string", description: "Parent goal ID if this is a sub-goal" },
    },
    handler: async (args) => {
      const goal = await prisma.goal.create({
        data: {
          level: args.level as string,
          title: args.title as string,
          description: (args.description as string) ?? null,
          parentId: (args.parentId as string) ?? null,
        },
      })
      return { success: true, data: goal }
    },
  },
  {
    name: "update_goal",
    description: "Update a goal's title, description, or completion status.",
    parameters: {
      goalId: { type: "string", description: "Goal ID", required: true },
      title: { type: "string", description: "New title" },
      description: { type: "string", description: "New description" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.title) data.title = args.title
      if (args.description !== undefined) data.description = args.description
      const goal = await prisma.goal.update({ where: { id: args.goalId as string }, data })
      return { success: true, data: goal }
    },
  },
  {
    name: "query_habits",
    description: "List all active habits with today's completion status.",
    parameters: {},
    handler: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const [habits, logs] = await Promise.all([
        prisma.habit.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
        prisma.habitLog.findMany({ where: { date: { gte: today } }, select: { habitId: true, completed: true } }),
      ])
      const doneMap = new Map(logs.filter((l) => l.completed).map((l) => [l.habitId, true]))
      return {
        success: true,
        data: habits.map((h) => ({ id: h.id, name: h.name, icon: h.icon, done: doneMap.has(h.id) })),
      }
    },
  },
  {
    name: "toggle_habit",
    description: "Mark a habit as done or undone for today.",
    parameters: {
      habitId: { type: "string", description: "Habit ID", required: true },
      done: { type: "boolean", description: "true = mark done, false = mark undone" },
    },
    handler: async (args) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const existing = await prisma.habitLog.findUnique({
        where: { habitId_date: { habitId: args.habitId as string, date: today } },
      })
      if (args.done === true || args.done === undefined) {
        if (existing) {
          await prisma.habitLog.update({ where: { id: existing.id }, data: { completed: true } })
        } else {
          await prisma.habitLog.create({ data: { habitId: args.habitId as string, date: today, completed: true } })
        }
      } else {
        if (existing) await prisma.habitLog.update({ where: { id: existing.id }, data: { completed: false } })
      }
      return { success: true, data: { habitId: args.habitId, done: args.done !== false } }
    },
  },
  {
    name: "query_journals",
    description: "Get journal entries filtered by category.",
    parameters: {
      category: { type: "string", description: "Filter by category", enum: ["daily", "learn", "project", "deen", "mary", "goal"] },
      limit: { type: "number", description: "Max entries (default 20)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.category) where.category = args.category as string
      const entries = await prisma.journalEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: (args.limit as number) ?? 20,
      })
      return { success: true, data: entries }
    },
  },
  {
    name: "create_journal",
    description: "Write a journal entry.",
    parameters: {
      category: { type: "string", description: "Entry category", enum: ["daily", "learn", "project", "deen", "mary", "goal"] },
      title: { type: "string", description: "Entry title" },
      content: { type: "string", description: "Entry content", required: true },
    },
    handler: async (args) => {
      const entry = await prisma.journalEntry.create({
        data: {
          category: (args.category as string) ?? "daily",
          title: (args.title as string) ?? null,
          content: args.content as string,
        },
      })
      return { success: true, data: entry }
    },
  },
  {
    name: "query_books",
    description: "List books in the reading tracker.",
    parameters: {
      status: { type: "string", description: "Filter by status", enum: ["unread", "reading", "finished"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.status) where.status = args.status as string
      const books = await prisma.book.findMany({ where, orderBy: { createdAt: "desc" } })
      return { success: true, data: books }
    },
  },
  {
    name: "query_timer_sessions",
    description: "Get timer/focus session stats for a date range.",
    parameters: {
      days: { type: "number", description: "Number of days to look back (default 7)" },
    },
    handler: async (args) => {
      const since = new Date()
      since.setDate(since.getDate() - ((args.days as number) ?? 7))
      const sessions = await prisma.timerSession.findMany({
        where: { createdAt: { gte: since }, completed: true },
        orderBy: { createdAt: "desc" },
      })
      const totalMinutes = sessions.reduce((s, x) => s + x.duration, 0)
      return { success: true, data: { totalSessions: sessions.length, totalMinutes, sessions } }
    },
  },
  {
    name: "query_learning_progress",
    description: "Get learning progress across all tracks (coding, figma, english, etc.).",
    parameters: {
      track: { type: "string", description: "Filter by track name" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.track) where.track = args.track as string
      const progress = await prisma.learningProgress.findMany({ where, orderBy: { createdAt: "desc" } })
      return { success: true, data: progress }
    },
  },
]
