import { prisma } from "@/lib/prisma"
import type { AgentNudgeInput } from "./types"

const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000

export async function hasBeenSent(input: AgentNudgeInput): Promise<boolean> {
  const since = new Date(Date.now() - DEDUP_WINDOW_MS)
  const existing = await prisma.agentNudge.findFirst({
    where: {
      type: input.type,
      title: input.title,
      createdAt: { gte: since },
    },
  })
  return !!existing
}

export async function storeNudge(input: AgentNudgeInput, sentToWhatsApp: boolean) {
  return prisma.agentNudge.create({
    data: {
      type: input.type,
      title: input.title,
      message: input.message,
      severity: input.severity,
      category: input.category,
      metadata: (input.metadata ?? {}) as any,
      sentToWhatsApp,
    },
  })
}

export async function getUnacknowledgedNudges(limit = 20) {
  return prisma.agentNudge.findMany({
    where: { acknowledged: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function acknowledgeNudge(id: string) {
  return prisma.agentNudge.update({
    where: { id },
    data: { acknowledged: true, acknowledgedAt: new Date() },
  })
}

export async function acknowledgeAllByType(type: string) {
  return prisma.agentNudge.updateMany({
    where: { type, acknowledged: false },
    data: { acknowledged: true, acknowledgedAt: new Date() },
  })
}

export async function acknowledgeAll() {
  return prisma.agentNudge.updateMany({
    where: { acknowledged: false },
    data: { acknowledged: true, acknowledgedAt: new Date() },
  })
}

export async function getUnreadCount(): Promise<number> {
  return prisma.agentNudge.count({ where: { acknowledged: false } })
}
