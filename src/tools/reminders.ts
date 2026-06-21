import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const reminderTools: ToolDef[] = [
  {
    name: "create_reminder",
    description: "Create a reminder that shows in the dashboard notification bell. User will see it when they check notifications.",
    parameters: {
      title: { type: "string", description: "Reminder title (what to remember)", required: true },
      context: { type: "string", description: "Additional context or details" },
      priority: { type: "string", description: "Priority level", enum: ["high", "medium", "low"] },
      dueAt: { type: "string", description: "ISO date string when this reminder is due" },
    },
    handler: async (args) => {
      const reminder = await prisma.reminder.create({
        data: {
          title: args.title as string,
          context: (args.context as string) ?? null,
          priority: (args.priority as string) ?? "medium",
          dueAt: args.dueAt ? new Date(args.dueAt as string) : null,
        },
      })
      return { success: true, data: reminder }
    },
  },
  {
    name: "dismiss_reminder",
    description: "Mark a reminder as dismissed (removes from bell notification).",
    parameters: {
      id: { type: "string", description: "Reminder ID to dismiss", required: true },
    },
    handler: async (args) => {
      await prisma.reminder.update({ where: { id: args.id as string }, data: { dismissed: true } })
      return { success: true, data: { dismissed: true } }
    },
  },
  {
    name: "list_reminders",
    description: "List all active (undismissed) reminders.",
    parameters: {},
    handler: async () => {
      const reminders = await prisma.reminder.findMany({
        where: { dismissed: false },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      })
      return { success: true, data: reminders }
    },
  },
]
