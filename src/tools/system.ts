import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const systemTools: ToolDef[] = [
  {
    name: "create_activity",
    description: "Log an entry in the dashboard activity feed.",
    parameters: {
      type: { type: "string", description: "Activity type (NOTE_ADDED, PROJECT_CREATED, PAYMENT_RECEIVED, etc.)", required: true },
      targetType: { type: "string", description: "Target type (client, project, settings, etc.)", required: true },
      targetId: { type: "string", description: "Target record ID", required: true },
      description: { type: "string", description: "Description text" },
    },
    handler: async (args) => {
      const activity = await prisma.activity.create({
        data: {
          type: args.type as string,
          actorName: "Hermes",
          targetType: args.targetType as string,
          targetId: args.targetId as string,
          meta: { source: "hermes_agent", description: (args.description as string) ?? "" },
        },
      })
      return { success: true, data: activity }
    },
  },
  {
    name: "list_content_calendar",
    description: "List upcoming content calendar entries for social media.",
    parameters: {
      platform: { type: "string", description: "Filter by platform (tiktok, instagram, facebook, etc.)" },
      status: { type: "string", description: "Filter by status", enum: ["draft", "scheduled", "posted", "cancelled"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.platform) where.platform = args.platform as string
      if (args.status) where.status = args.status as string
      const entries = await prisma.contentCalendar.findMany({
        where,
        orderBy: { scheduledFor: "asc" },
        take: 50,
      })
      return { success: true, data: entries }
    },
  },
  {
    name: "query_automation_rules",
    description: "List automation rules with their triggers and actions.",
    parameters: {},
    handler: async () => {
      const rules = await prisma.automationRule.findMany({ orderBy: { createdAt: "desc" } })
      return { success: true, data: rules }
    },
  },
  {
    name: "get_user_config",
    description: "Get user configuration values from the dashboard settings.",
    parameters: {},
    handler: async () => {
      const configs = await prisma.userConfig.findMany()
      const map: Record<string, string> = {}
      for (const c of configs) map[c.key] = c.value
      return { success: true, data: map }
    },
  },
]
