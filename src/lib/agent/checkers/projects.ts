import { prisma } from "@/lib/prisma"
import type { AgentNudgeInput } from "../types"

export async function check(): Promise<{ nudges: AgentNudgeInput[] }> {
  const nudges: AgentNudgeInput[] = []

  const now = new Date()

  const activeProjects = await prisma.project.findMany({
    where: { status: { in: ["IN_PROGRESS", "REVISION", "DEPOSIT_PAID"] } },
  })

  for (const project of activeProjects) {
    const daysInStage = Math.floor(
      (now.getTime() - new Date(project.createdAt).getTime()) / 86400000
    )

    const stageLabel = project.status.replace(/_/g, " ")

    if (daysInStage > 30) {
      nudges.push({
        type: "project",
        title: "Project stalled",
        message: `"${project.serviceType}" has been in ${stageLabel} for ${daysInStage} days.`,
        severity: "high",
        metadata: { projectId: project.id },
        sendWhatsApp: true,
      })
    } else if (daysInStage > 14) {
      nudges.push({
        type: "project",
        title: "Project needs attention",
        message: `"${project.serviceType}" has been in ${stageLabel} for ${daysInStage} days.`,
        severity: "medium",
        metadata: { projectId: project.id },
      })
    }
  }

  if (activeProjects.length >= 5) {
    nudges.push({
      type: "project",
      title: "Capacity alert",
      message: `You have ${activeProjects.length} active projects — consider your workload.`,
      severity: "medium",
    })
  }

  return { nudges }
}
