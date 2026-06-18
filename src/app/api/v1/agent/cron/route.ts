/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const results: {
      stalledProjects: { id: string; clientName: string; serviceType: string; daysInStage: number; status: string }[]
      pendingInvoices: { count: number; total: number }
      retainerRenewals: { id: string; clientName: string; package: string; monthlyValue: number; nextPaymentDate: string }[]
      weeklyNewClients: number
      habitsToday: { done: number; total: number }
      unreadGoals: number
      overdueBooks: number
      timerMinutes: number
    } = {
      stalledProjects: [],
      pendingInvoices: { count: 0, total: 0 },
      retainerRenewals: [],
      weeklyNewClients: 0,
      habitsToday: { done: 0, total: 0 },
      unreadGoals: 0,
      overdueBooks: 0,
      timerMinutes: 0,
    }

    // Stalled projects (7+ days in same non-final stage)
    const projects = await prisma.project.findMany({
      where: { status: { in: ["NEW_INQUIRY", "QUOTED", "DEPOSIT_PAID", "IN_PROGRESS", "REVISION"] } },
      include: { client: { select: { name: true } } },
    })
    const now = Date.now()
    for (const p of projects) {
      const updatedAt = p.updatedAt || p.createdAt
      const days = Math.floor((now - updatedAt.getTime()) / 86400000)
      if (days >= 7) {
        results.stalledProjects.push({
          id: p.id,
          clientName: p.client?.name || "Unknown",
          serviceType: p.serviceType,
          daysInStage: days,
          status: p.status,
        })
      }
    }

    // Pending invoices
    const unpaid = await prisma.payment.findMany({ where: { status: "UNPAID" } })
    results.pendingInvoices = { count: unpaid.length, total: unpaid.reduce((s, p) => s + p.amount, 0) }

    // Retainer renewals due within 7 days
    const weekFromNow = new Date(Date.now() + 7 * 86400000)
    const retainers = await prisma.retainer.findMany({
      where: { status: "active", nextPaymentDate: { lte: weekFromNow } },
      include: { client: { select: { name: true } } },
    })
    for (const r of retainers) {
      results.retainerRenewals.push({
        id: r.id,
        clientName: r.client?.name || "Unknown",
        package: r.package,
        monthlyValue: r.monthlyValue,
        nextPaymentDate: r.nextPaymentDate?.toISOString() || "",
      })
    }

    // New clients this week
    const weekAgo = new Date(Date.now() - 7 * 86400000)
    results.weeklyNewClients = await prisma.client.count({ where: { createdAt: { gte: weekAgo } } })

    // Habits today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const totalHabits = await prisma.habit.count({ where: { isActive: true } })
    const doneHabits = await prisma.habitLog.count({ where: { date: { gte: today }, completed: true } })
    results.habitsToday = { done: doneHabits, total: totalHabits }

    // Unread goals
    results.unreadGoals = await prisma.goal.count()

    // Timer total today
    const timerAgg = await prisma.timerSession.aggregate({ _sum: { duration: true }, where: { createdAt: { gte: today } } })
    results.timerMinutes = Math.floor((timerAgg._sum.duration || 0) / 60)

    // Books in progress
    results.overdueBooks = await prisma.book.count({ where: { status: "reading" } })

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary: `📊 Daily Cron • ${new Date().toLocaleDateString()}

**Business**
• ${results.stalledProjects.length} stalled projects
• ${results.pendingInvoices.count} unpaid invoices (TSh ${results.pendingInvoices.total.toLocaleString()})
• ${results.retainerRenewals.length} retainer renewals due soon
• ${results.weeklyNewClients} new clients this week

**Personal**
• Habits: ${results.habitsToday.done}/${results.habitsToday.total} done today
• ${results.unreadGoals} active goals
• ${results.overdueBooks} books in progress
• ${results.timerMinutes} min focused today`,
      details: results,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
