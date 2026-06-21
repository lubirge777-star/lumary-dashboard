import type { ToolDef, ToolParam } from "./types"
import { dashboardTools } from "./dashboard"
import { clientTools } from "./clients"
import { projectTools } from "./projects"
import { financeTools } from "./finance"
import { messagingTools } from "./messaging"
import { personalTools } from "./personal"
import { reminderTools } from "./reminders"
import { scheduleTools } from "./schedule"
import { systemTools } from "./system"

const allTools: ToolDef[] = [
  ...dashboardTools,
  ...clientTools,
  ...projectTools,
  ...financeTools,
  ...messagingTools,
  ...personalTools,
  ...reminderTools,
  ...scheduleTools,
  ...systemTools,
]

const toolMap = new Map(allTools.map((t) => [t.name, t]))

export function getToolDefs() {
  return allTools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(t.parameters).map(([k, v]) => [
            k,
            { type: v.type, description: v.description, ...(v.enum ? { enum: v.enum } : {}) },
          ])
        ),
        required: Object.entries(t.parameters).filter(([, v]) => v.required).map(([k]) => k),
      },
    },
  }))
}

export async function executeTool(name: string, args: Record<string, ToolParam>) {
  const tool = toolMap.get(name)
  if (!tool) return { success: false, error: `Unknown tool: ${name}` }
  try {
    return await tool.handler(args)
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export { type ToolParam } from "./types"
