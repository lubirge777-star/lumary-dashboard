import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const systemTools: ToolDef[] = [
  // ── Activity Feed ──
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

  // ── Automation Rules ──
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
    name: "create_automation_rule",
    description: "Create a new automation rule.",
    parameters: {
      name: { type: "string", description: "Rule name", required: true },
      description: { type: "string", description: "What this rule does" },
      trigger: { type: "string", description: "Trigger event", required: true },
      conditions: { type: "string", description: "JSON array of condition objects" },
      actions: { type: "string", description: "JSON array of action objects", required: true },
    },
    handler: async (args) => {
      const rule = await prisma.automationRule.create({
        data: {
          name: args.name as string,
          description: (args.description as string) ?? null,
          trigger: args.trigger as string,
          conditions: args.conditions ? JSON.parse(args.conditions as string) : [],
          actions: JSON.parse(args.actions as string),
        },
      })
      return { success: true, data: rule }
    },
  },
  {
    name: "update_automation_rule",
    description: "Update an automation rule's trigger, conditions, actions, or active state.",
    parameters: {
      ruleId: { type: "string", description: "Rule ID", required: true },
      name: { type: "string", description: "Updated name" },
      description: { type: "string", description: "Updated description" },
      trigger: { type: "string", description: "Updated trigger" },
      conditions: { type: "string", description: "JSON array of conditions" },
      actions: { type: "string", description: "JSON array of actions" },
      isActive: { type: "boolean", description: "Enable or disable the rule" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.name) data.name = args.name
      if (args.description !== undefined) data.description = args.description
      if (args.trigger) data.trigger = args.trigger
      if (args.conditions) data.conditions = JSON.parse(args.conditions as string)
      if (args.actions) data.actions = JSON.parse(args.actions as string)
      if (args.isActive !== undefined) data.isActive = args.isActive
      const rule = await prisma.automationRule.update({ where: { id: args.ruleId as string }, data })
      return { success: true, data: rule }
    },
  },
  {
    name: "delete_automation_rule",
    description: "Delete an automation rule.",
    parameters: {
      ruleId: { type: "string", description: "Rule ID", required: true },
    },
    handler: async (args) => {
      await prisma.automationRule.delete({ where: { id: args.ruleId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── User Config ──
  {
    name: "get_user_config",
    description: "Get all user configuration values.",
    parameters: {},
    handler: async () => {
      const configs = await prisma.userConfig.findMany()
      const map: Record<string, string> = {}
      for (const c of configs) map[c.key] = c.value
      return { success: true, data: map }
    },
  },
  {
    name: "update_user_config",
    description: "Set a user configuration value.",
    parameters: {
      key: { type: "string", description: "Config key", required: true },
      value: { type: "string", description: "Config value", required: true },
    },
    handler: async (args) => {
      const config = await prisma.userConfig.upsert({
        where: { key: args.key as string },
        create: { key: args.key as string, value: args.value as string },
        update: { value: args.value as string },
      })
      return { success: true, data: config }
    },
  },

  // ── Integrations ──
  {
    name: "query_integrations",
    description: "List connected integrations (Evolution API, Chatwoot, Typebot).",
    parameters: {},
    handler: async () => {
      const integrations = await prisma.integration.findMany({ orderBy: { name: "asc" } })
      return { success: true, data: integrations }
    },
  },
  {
    name: "update_integration",
    description: "Update integration status or config.",
    parameters: {
      integrationId: { type: "string", description: "Integration ID", required: true },
      status: { type: "string", description: "New status", enum: ["connected", "disconnected", "error"] },
      config: { type: "string", description: "JSON config object" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.status) data.status = args.status
      if (args.config) data.config = JSON.parse(args.config as string)
      const integration = await prisma.integration.update({ where: { id: args.integrationId as string }, data })
      return { success: true, data: integration }
    },
  },

  // ── Webhook Logs ──
  {
    name: "query_webhook_logs",
    description: "List recent webhook events from all sources.",
    parameters: {
      source: { type: "string", description: "Filter by source (e.g., whatsapp, webhook)" },
      limit: { type: "number", description: "Max results (default 20)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.source) where.source = args.source as string
      const logs = await prisma.webhookLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: (args.limit as number) ?? 20,
      })
      return { success: true, data: logs }
    },
  },

  // ── Custom Pages ──
  {
    name: "query_custom_pages",
    description: "List all custom dashboard pages.",
    parameters: {},
    handler: async () => {
      const pages = await prisma.customPage.findMany({ orderBy: { updatedAt: "desc" } })
      return { success: true, data: pages }
    },
  },
  {
    name: "create_custom_page",
    description: "Create a new custom dashboard page.",
    parameters: {
      title: { type: "string", description: "Page title", required: true },
      slug: { type: "string", description: "URL slug (unique)", required: true },
      config: { type: "string", description: "JSON page config (blocks, layout, dataSource)" },
    },
    handler: async (args) => {
      const page = await prisma.customPage.create({
        data: {
          title: args.title as string,
          slug: args.slug as string,
          config: args.config ? JSON.parse(args.config as string) : { blocks: [], layout: "grid" },
        },
      })
      return { success: true, data: page }
    },
  },
  {
    name: "update_custom_page",
    description: "Update a custom page's title or config.",
    parameters: {
      pageId: { type: "string", description: "Page ID", required: true },
      title: { type: "string", description: "Updated title" },
      config: { type: "string", description: "JSON page config" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.title) data.title = args.title
      if (args.config) data.config = JSON.parse(args.config as string)
      const page = await prisma.customPage.update({ where: { id: args.pageId as string }, data })
      return { success: true, data: page }
    },
  },
  {
    name: "delete_custom_page",
    description: "Delete a custom page.",
    parameters: {
      pageId: { type: "string", description: "Page ID", required: true },
    },
    handler: async (args) => {
      await prisma.customPage.delete({ where: { id: args.pageId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Quick Replies / Templates ──
  {
    name: "query_quick_replies",
    description: "List WhatsApp quick reply templates.",
    parameters: {
      category: { type: "string", description: "Filter by category" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.category) where.category = args.category as string
      const replies = await prisma.quickReply.findMany({ where, orderBy: { shortcut: "asc" } })
      return { success: true, data: replies }
    },
  },
  {
    name: "create_quick_reply",
    description: "Create a quick reply template for WhatsApp messages.",
    parameters: {
      shortcut: { type: "string", description: "Shortcut key (e.g. greeting)", required: true },
      title: { type: "string", description: "Display title", required: true },
      content: { type: "string", description: "Template content", required: true },
      category: { type: "string", description: "Category" },
    },
    handler: async (args) => {
      const reply = await prisma.quickReply.create({
        data: {
          shortcut: args.shortcut as string,
          title: args.title as string,
          content: args.content as string,
          category: (args.category as string) ?? null,
        },
      })
      return { success: true, data: reply }
    },
  },
  {
    name: "update_quick_reply",
    description: "Update a quick reply template.",
    parameters: {
      replyId: { type: "string", description: "Quick reply ID", required: true },
      title: { type: "string", description: "Updated title" },
      content: { type: "string", description: "Updated content" },
      category: { type: "string", description: "Updated category" },
      isActive: { type: "boolean", description: "Enable/disable" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.title) data.title = args.title
      if (args.content) data.content = args.content
      if (args.category !== undefined) data.category = args.category
      if (args.isActive !== undefined) data.isActive = args.isActive
      const reply = await prisma.quickReply.update({ where: { id: args.replyId as string }, data })
      return { success: true, data: reply }
    },
  },
  {
    name: "delete_quick_reply",
    description: "Delete a quick reply template.",
    parameters: {
      replyId: { type: "string", description: "Quick reply ID", required: true },
    },
    handler: async (args) => {
      await prisma.quickReply.delete({ where: { id: args.replyId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Service Pricing ──
  {
    name: "query_service_pricing",
    description: "List service pricing tiers and categories.",
    parameters: {
      category: { type: "string", description: "Filter by category" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.category) where.category = args.category as string
      const prices = await prisma.servicePricing.findMany({
        where,
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      })
      return { success: true, data: prices }
    },
  },
  {
    name: "create_service_pricing",
    description: "Add a service pricing entry.",
    parameters: {
      name: { type: "string", description: "Service name", required: true },
      category: { type: "string", description: "Category", required: true },
      floorTsh: { type: "number", description: "Minimum price in TSh", required: true },
      ceilingTsh: { type: "number", description: "Maximum price in TSh", required: true },
      floorUsd: { type: "number", description: "Minimum price in USD" },
      ceilingUsd: { type: "number", description: "Maximum price in USD" },
      estimatedHr: { type: "number", description: "Estimated hours" },
      description: { type: "string", description: "Service description" },
    },
    handler: async (args) => {
      const pricing = await prisma.servicePricing.create({
        data: {
          name: args.name as string,
          category: args.category as string,
          floorTsh: args.floorTsh as number,
          ceilingTsh: args.ceilingTsh as number,
          floorUsd: (args.floorUsd as number) ?? null,
          ceilingUsd: (args.ceilingUsd as number) ?? null,
          estimatedHr: (args.estimatedHr as number) ?? null,
          description: (args.description as string) ?? null,
        },
      })
      return { success: true, data: pricing }
    },
  },
  {
    name: "update_service_pricing",
    description: "Update a service pricing entry.",
    parameters: {
      pricingId: { type: "string", description: "Pricing ID", required: true },
      name: { type: "string", description: "Updated name" },
      floorTsh: { type: "number", description: "Updated floor TSh" },
      ceilingTsh: { type: "number", description: "Updated ceiling TSh" },
      isActive: { type: "boolean", description: "Enable/disable" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.name) data.name = args.name
      if (args.floorTsh !== undefined) data.floorTsh = args.floorTsh
      if (args.ceilingTsh !== undefined) data.ceilingTsh = args.ceilingTsh
      if (args.isActive !== undefined) data.isActive = args.isActive
      const pricing = await prisma.servicePricing.update({ where: { id: args.pricingId as string }, data })
      return { success: true, data: pricing }
    },
  },
  {
    name: "delete_service_pricing",
    description: "Delete a service pricing entry.",
    parameters: {
      pricingId: { type: "string", description: "Pricing ID", required: true },
    },
    handler: async (args) => {
      await prisma.servicePricing.delete({ where: { id: args.pricingId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Pipeline Steps ──
  {
    name: "query_pipeline_steps",
    description: "Get pipeline steps for a project.",
    parameters: {
      projectId: { type: "string", description: "Project ID", required: true },
    },
    handler: async (args) => {
      const steps = await prisma.pipelineStep.findMany({
        where: { projectId: args.projectId as string },
        orderBy: { createdAt: "asc" },
      })
      return { success: true, data: steps }
    },
  },
  {
    name: "create_pipeline_step",
    description: "Manually add a pipeline step to a project.",
    parameters: {
      projectId: { type: "string", description: "Project ID", required: true },
      step: { type: "string", description: "Step key (inquiry, quote, deposit, brief, deliver, revise, final, followup)", required: true },
      notes: { type: "string", description: "Notes about this step" },
    },
    handler: async (args) => {
      const step = await prisma.pipelineStep.upsert({
        where: { projectId_step: { projectId: args.projectId as string, step: args.step as string } },
        create: {
          projectId: args.projectId as string,
          step: args.step as string,
          notes: (args.notes as string) ?? null,
          completedAt: new Date(),
        },
        update: {
          notes: (args.notes as string) ?? undefined,
          completedAt: new Date(),
        },
      })
      return { success: true, data: step }
    },
  },

  // ── Project Checkups ──
  {
    name: "query_project_checkups",
    description: "Get project checkup questions and answers.",
    parameters: {
      projectId: { type: "string", description: "Project ID", required: true },
    },
    handler: async (args) => {
      const checkups = await prisma.projectCheckup.findMany({
        where: { projectId: args.projectId as string },
        orderBy: { createdAt: "asc" },
      })
      return { success: true, data: checkups }
    },
  },
  {
    name: "answer_project_checkup",
    description: "Answer a project checkup question.",
    parameters: {
      checkupId: { type: "string", description: "Checkup ID", required: true },
      answer: { type: "string", description: "Your answer", required: true },
    },
    handler: async (args) => {
      const checkup = await prisma.projectCheckup.update({
        where: { id: args.checkupId as string },
        data: { answer: args.answer as string, status: "answered", answeredAt: new Date() },
      })
      return { success: true, data: checkup }
    },
  },

  // ── Wedge Log ──
  {
    name: "query_wedge_logs",
    description: "List wedge log entries (product ideas from problems).",
    parameters: {
      potential: { type: "string", description: "Filter by potential", enum: ["low", "medium", "high"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.potential) where.potential = args.potential as string
      const logs = await prisma.wedgeLog.findMany({ where, orderBy: { createdAt: "desc" } })
      return { success: true, data: logs }
    },
  },
  {
    name: "create_wedge_log",
    description: "Log a problem that could become a product.",
    parameters: {
      problem: { type: "string", description: "The problem you observed", required: true },
      description: { type: "string", description: "More context" },
      clientCount: { type: "number", description: "How many clients have this problem" },
      frequency: { type: "string", description: "How often it occurs", enum: ["daily", "weekly", "monthly"] },
      potential: { type: "string", description: "Business potential", enum: ["low", "medium", "high"] },
    },
    handler: async (args) => {
      const log = await prisma.wedgeLog.create({
        data: {
          problem: args.problem as string,
          description: (args.description as string) ?? null,
          clientCount: (args.clientCount as number) ?? 1,
          frequency: (args.frequency as string) ?? null,
          potential: (args.potential as string) ?? null,
        },
      })
      return { success: true, data: log }
    },
  },
  {
    name: "update_wedge_log",
    description: "Update a wedge log entry.",
    parameters: {
      logId: { type: "string", description: "Wedge log ID", required: true },
      problem: { type: "string", description: "Updated problem" },
      description: { type: "string", description: "Updated description" },
      isProduct: { type: "boolean", description: "Mark as productized" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.problem) data.problem = args.problem
      if (args.description !== undefined) data.description = args.description
      if (args.isProduct !== undefined) data.isProduct = args.isProduct
      const log = await prisma.wedgeLog.update({ where: { id: args.logId as string }, data })
      return { success: true, data: log }
    },
  },
  {
    name: "delete_wedge_log",
    description: "Delete a wedge log entry.",
    parameters: {
      logId: { type: "string", description: "Wedge log ID", required: true },
    },
    handler: async (args) => {
      await prisma.wedgeLog.delete({ where: { id: args.logId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Income Logs ──
  {
    name: "query_income_logs",
    description: "Get weekly income log history.",
    parameters: {
      limit: { type: "number", description: "Max results (default 12)" },
    },
    handler: async (args) => {
      const logs = await prisma.incomeLog.findMany({
        orderBy: { weekStart: "desc" },
        take: (args.limit as number) ?? 12,
      })
      return { success: true, data: logs }
    },
  },
  {
    name: "create_income_log",
    description: "Log weekly income summary.",
    parameters: {
      weekStart: { type: "string", description: "ISO date for Monday of the week", required: true },
      amountTsh: { type: "number", description: "Total income in TSh", required: true },
      clientCount: { type: "number", description: "Number of paying clients" },
      retainerCount: { type: "number", description: "Number of retainers active" },
      unpaidAmount: { type: "number", description: "Amount still unpaid in TSh" },
      notes: { type: "string", description: "Notes about the week" },
    },
    handler: async (args) => {
      const log = await prisma.incomeLog.create({
        data: {
          weekStart: new Date(args.weekStart as string),
          amountTsh: args.amountTsh as number,
          clientCount: (args.clientCount as number) ?? 0,
          retainerCount: (args.retainerCount as number) ?? 0,
          unpaidAmount: (args.unpaidAmount as number) ?? 0,
          notes: (args.notes as string) ?? null,
        },
      })
      return { success: true, data: log }
    },
  },
  {
    name: "update_income_log",
    description: "Update a weekly income log.",
    parameters: {
      logId: { type: "string", description: "Income log ID", required: true },
      amountTsh: { type: "number", description: "Updated amount" },
      unpaidAmount: { type: "number", description: "Updated unpaid amount" },
      notes: { type: "string", description: "Updated notes" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.amountTsh !== undefined) data.amountTsh = args.amountTsh
      if (args.unpaidAmount !== undefined) data.unpaidAmount = args.unpaidAmount
      if (args.notes !== undefined) data.notes = args.notes
      const log = await prisma.incomeLog.update({ where: { id: args.logId as string }, data })
      return { success: true, data: log }
    },
  },
  {
    name: "delete_income_log",
    description: "Delete an income log entry.",
    parameters: {
      logId: { type: "string", description: "Income log ID", required: true },
    },
    handler: async (args) => {
      await prisma.incomeLog.delete({ where: { id: args.logId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── WhatsApp Sync Status ──
  {
    name: "get_whatsapp_status",
    description: "Get WhatsApp connection status and message stats.",
    parameters: {},
    handler: async () => {
      const status = await prisma.whatsAppSync.findFirst({ orderBy: { createdAt: "desc" } })
      return { success: true, data: status ?? { state: "unknown" } }
    },
  },
]
