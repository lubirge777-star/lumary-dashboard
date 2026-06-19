/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateContent } from "@/lib/gemini"

export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get("page") || "/"

    const [stalled, unpaid, unpaidTotal, habitsToday, habitsTotal, activeGoals, dueRetainers] = await Promise.all([
      prisma.project.count({
        where: {
          status: { in: ["NEW_INQUIRY", "QUOTED", "IN_PROGRESS", "REVISION"] },
          updatedAt: { lte: new Date(Date.now() - 7 * 86400000) },
        },
      }),
      prisma.payment.count({ where: { status: "UNPAID" } }),
      prisma.payment.aggregate({ where: { status: "UNPAID" }, _sum: { amount: true } }),
      prisma.habitLog.count({ where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }, completed: true } }),
      10, // total habits
      prisma.goal.count({ where: { level: { in: ["today", "week"] } } }),
      prisma.retainer.count({ where: { nextPaymentDate: { lte: new Date(Date.now() + 7 * 86400000) }, status: "ACTIVE" } }),
    ])

    const nudges: { priority: "high" | "medium" | "low"; message: string; actionLabel?: string; actionRoute?: string }[] = []

    if (stalled > 0) nudges.push({ priority: "high", message: `${stalled} project${stalled > 1 ? "s" : ""} stalled for 7+ days`, actionLabel: "View Pipeline", actionRoute: "/projects" })
    if (unpaid > 0) nudges.push({ priority: "high", message: `${unpaid} unpaid invoice${unpaid > 1 ? "s" : ""} — TSh ${(unpaidTotal._sum.amount || 0).toLocaleString()}`, actionLabel: "View Finance", actionRoute: "/finance" })
    if (habitsTotal - habitsToday > 0) nudges.push({ priority: "medium", message: `${habitsTotal - habitsToday} habit${habitsTotal - habitsToday > 1 ? "s" : ""} left today`, actionLabel: "View Habits", actionRoute: "/habits" })
    if (dueRetainers > 0) nudges.push({ priority: "medium", message: `${dueRetainers} retainer${dueRetainers > 1 ? "s" : ""} renewing this week`, actionLabel: "View Retainers", actionRoute: "/retainers" })
    if (activeGoals > 0) nudges.push({ priority: "low", message: `${activeGoals} active goal${activeGoals > 1 ? "s" : ""} — check progress`, actionLabel: "View Goals", actionRoute: "/goals" })

    const dbNudges = await prisma.agentNudge.findMany({
      where: { acknowledged: false, createdAt: { gte: new Date(Date.now() - 86400000) } },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Try to generate smart nudge with AI
    let aiNudge: string | null = null
    if (nudges.length > 0) {
      const summary = nudges.map((n) => n.message).join(", ")
      aiNudge = await generateContent(
        "You are a proactive dashboard assistant. Given the current state, generate ONE short actionable nudge (max 15 words) that the user should act on right now. Return ONLY the nudge text, no markdown.",
        `Current state: ${summary}. Page: ${page}`,
      )
    }

    const all: { priority: "high" | "medium" | "low"; message: string; actionLabel?: string; actionRoute?: string }[] = dbNudges.map((n: any) => ({ priority: "medium", message: n.message, actionLabel: n.actionLabel || undefined, actionRoute: n.actionRoute || undefined }))

    if (aiNudge && aiNudge.trim()) all.unshift({ priority: "high", message: aiNudge.trim().replace(/^["']|["']$/g, "") })

    return Response.json({ nudges: all })
  } catch {
    return Response.json({ nudges: [] })
  }
}
