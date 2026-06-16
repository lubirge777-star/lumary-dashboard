import { prisma } from "@/lib/prisma"
import type { AgentNudgeInput } from "../types"

export async function check(): Promise<{ nudges: AgentNudgeInput[] }> {
  const nudges: AgentNudgeInput[] = []

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000)

  const unpaidPayments = await prisma.payment.findMany({
    where: { status: { in: ["UNPAID", "OVERDUE"] } },
  })

  const overdue = unpaidPayments.filter(p => new Date(p.createdAt) < thirtyDaysAgo)
  for (const payment of overdue) {
    const daysOverdue = Math.floor((now.getTime() - new Date(payment.createdAt).getTime()) / 86400000)
    nudges.push({
      type: "payment",
      title: "Payment overdue",
      message: `Payment of TSh ${payment.amount.toLocaleString()} is overdue (${daysOverdue} days).`,
      severity: "high",
      metadata: { paymentId: payment.id },
      sendWhatsApp: true,
    })
  }

  const unpaidOld = unpaidPayments.filter(
    p => p.status === "UNPAID" && new Date(p.createdAt) < sevenDaysAgo
  )
  for (const payment of unpaidOld) {
    const daysOld = Math.floor((now.getTime() - new Date(payment.createdAt).getTime()) / 86400000)
    nudges.push({
      type: "payment",
      title: "Payment pending",
      message: `Payment of TSh ${payment.amount.toLocaleString()} has been unpaid for ${daysOld} days.`,
      severity: "medium",
      metadata: { paymentId: payment.id },
    })
  }

  const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + p.amount, 0)
  if (totalUnpaid > 0 && nudges.length === 0) {
    nudges.push({
      type: "payment",
      title: "Unpaid balance",
      message: `You have TSh ${totalUnpaid.toLocaleString()} in unpaid payments.`,
      severity: "low",
    })
  }

  return { nudges }
}
