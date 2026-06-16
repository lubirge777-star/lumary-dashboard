import type { AutomationRule, AutomationCondition, AutomationAction } from "@/types"
import { saveMessage, createActivity, getClients, getProjects, getRetainers, db } from "@/lib/data-service"
import { sendWhatsApp } from "@/lib/whatsapp"

type EventPayload = {
  type: string
  clientId?: string
  projectId?: string
  paymentId?: string
  messageContent?: string
  clientPhone?: string
  [key: string]: any
}

function evaluateCondition(condition: AutomationCondition, payload: EventPayload): boolean {
  const fieldValue = payload[condition.field] ?? ""

  switch (condition.operator) {
    case "equals":
      return String(fieldValue) === condition.value
    case "contains":
      return String(fieldValue).toLowerCase().includes(condition.value.toLowerCase())
    case "gt":
      return Number(fieldValue) > Number(condition.value)
    case "lt":
      return Number(fieldValue) < Number(condition.value)
    case "not_empty":
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== ""
    default:
      return false
  }
}

async function executeAction(action: AutomationAction, payload: EventPayload) {
  switch (action.type) {
    case "SEND_WHATSAPP": {
      const phone = payload.clientPhone || action.config.to
      const message = action.config.template
        ? action.config.template.replace(/{{(\w+)}}/g, (_, key) => payload[key] || "")
        : action.config.message
      if (phone && message) {
        const result = await sendWhatsApp(phone, message)
        if (result.success) {
          await createActivity({
            type: "MESSAGE_SENT",
            targetType: "automation",
            targetId: payload.clientId || "system",
            meta: { action: "send_whatsapp", phone, message },
          })
        }
      }
      break
    }
    case "UPDATE_PROJECT_STATUS": {
      const p = await db()
      if (p && payload.projectId) {
        await p.project.update({ where: { id: payload.projectId }, data: { status: action.config.status as any } })
        await createActivity({
          type: "PROJECT_STATUS_CHANGED",
          targetType: "Project",
          targetId: payload.projectId,
          meta: { newStatus: action.config.status, source: "automation" },
        })
      }
      break
    }
    case "CREATE_ACTIVITY": {
      await createActivity({
        type: "AUTOMATION_RUN",
        targetType: action.config.targetType || "automation",
        targetId: action.config.targetId || "system",
        meta: { ruleAction: action.type, ...payload },
      })
      break
    }
    case "CREATE_REMINDER": {
      await createActivity({
        type: "REMINDER_SENT",
        actorName: "System",
        targetType: action.config.targetType || "reminder",
        targetId: payload.clientId || "system",
        meta: { note: action.config.note || action.config.message, dueAt: action.config.dueAt },
      })
      break
    }
  }
}

export async function evaluateRules(trigger: string, payload: EventPayload) {
  const p = await db()
  if (!p) return

  const rules = await p.automationRule.findMany({ where: { isActive: true, trigger } })

  for (const rule of rules) {
    const conditions = (rule.conditions ?? []) as unknown as AutomationCondition[]
    const allMatch = conditions.length === 0 || conditions.every((c) => evaluateCondition(c, payload))

    if (allMatch) {
      const actions = (rule.actions ?? []) as unknown as AutomationAction[]
      for (const action of actions) {
        await executeAction(action, payload)
      }

      await p.automationRule.update({
        where: { id: rule.id },
        data: { runCount: { increment: 1 }, lastRunAt: new Date() },
      })
    }
  }
}

export async function getDefaultRules(): Promise<Omit<AutomationRule, "id" | "createdAt" | "runCount" | "lastRunAt">[]> {
  return [
    {
      name: "Welcome new client",
      description: "Send welcome message when a new client is created",
      trigger: "client_created",
      conditions: [],
      actions: [{ type: "SEND_WHATSAPP", config: { template: "Habari {{clientName}}! Karibu LUMARY Studio. Tunafurahi kukuhudumia!", to: "{{clientPhone}}" } }],
      isActive: true,
    },
    {
      name: "Follow up on stalled projects",
      description: "Send reminder when project hasn't moved in 7 days",
      trigger: "inactivity_alert",
      conditions: [{ field: "daysInStage", operator: "gt", value: "7" }],
      actions: [{ type: "CREATE_REMINDER", config: { note: "Project stalled — send follow-up message", targetType: "Project" } }],
      isActive: true,
    },
    {
      name: "Thank you on payment",
      description: "Thank client when payment is received",
      trigger: "payment_received",
      conditions: [],
      actions: [{ type: "SEND_WHATSAPP", config: { template: "Asante {{clientName}}! Malipo yako yamepokelewa. Tutaendelea na mradi wako.", to: "{{clientPhone}}" } }],
      isActive: true,
    },
    {
      name: "Status update on message received",
      description: "Auto-acknowledge when client sends a message",
      trigger: "message_received",
      conditions: [{ field: "messageContent", operator: "not_empty", value: "" }],
      actions: [{ type: "CREATE_ACTIVITY", config: { targetType: "Message" } }],
      isActive: true,
    },
  ]
}
