"use client"

import { useMemo } from "react"
import { usePayments, useProjects, useClients } from "@/lib/api-hooks"
import { formatTSh } from "@/lib/utils"
import type { Payment, Client, Project } from "@/types"
import { TrendingUp, Minus, Briefcase, Clock } from "lucide-react"

export function KpiCards() {
  const { data: projectsData } = useProjects()
  const { data: clientsData } = useClients()
  const projects = ((projectsData as any)?.items ?? []) as Project[]
  const clients = ((clientsData as any)?.items ?? []) as Client[]
  const { data: paymentsData } = usePayments()
  const payments: Payment[] = paymentsData?.items ?? []

  const monthlyRevenue = useMemo(() => {
    return payments
      .filter((p) => p.status === "PAID")
      .reduce((s, p) => s + p.amount, 0)
  }, [payments])

  const activeProjects = projects.filter((p) => !["FINAL_DELIVERED", "PAID"].includes(p.status)).length
  const activeClients = clients.filter((c) => c.status === "ACTIVE" || c.status === "RETAINER").length

  const newThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000
    return clients.filter((c) => new Date(c.createdAt).getTime() > weekAgo).length
  }, [clients])

  const conversionRate = clients.length > 0
    ? ((payments.length / clients.length) * 100).toFixed(1)
    : "0.0"

  const cards = [
    {
      label: "Monthly Revenue",
      value: formatTSh(monthlyRevenue),
      trend: { direction: "up" as const, value: "12.5%" },
      trendLabel: "vs last month",
      gradient: "grad-orange",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      icon: <span className="material-symbols-outlined text-[28px]">payments</span>,
    },
    {
      label: "Active Projects",
      value: activeProjects.toString(),
      trend: { direction: "up" as const, value: `${newThisWeek} New` },
      trendLabel: "this week",
      gradient: "grad-blue",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      label: "Active Clients",
      value: activeClients.toString(),
      trend: { direction: "flat" as const, value: "Stable" },
      trendLabel: "vs last month",
      gradient: "grad-purple",
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
      icon: <span className="material-symbols-outlined text-[28px]">group</span>,
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      trend: { direction: "up" as const, value: "2.1%" },
      trendLabel: "vs last month",
      gradient: "grad-green",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-300",
      icon: <span className="material-symbols-outlined text-[28px]">insights</span>,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter animate-fadeInUp">
      {cards.map((card) => {
        const TrendIcon = card.trend.direction === "up" ? TrendingUp : Minus
        const trendColor = card.trend.direction === "up"
          ? "text-emerald-600 bg-emerald-100/50 dark:text-emerald-300 dark:bg-emerald-500/15"
          : "text-primary bg-primary/10"

        return (
          <div key={card.label} className="glass-card p-card-padding flex flex-col relative overflow-hidden group hover:shadow-lg dark:hover:shadow-black/30 transition-shadow">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.gradient} rounded-full opacity-10 blur-2xl group-hover:opacity-30 transition-opacity`} />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-label-sm text-on-surface-variant opacity-70 mb-2">{card.label}</p>
                <h3 className="text-headline-xl text-on-surface font-bold">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center ${card.iconColor} shrink-0`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-auto pt-6 flex items-center gap-2">
              <span className={`flex items-center ${trendColor} px-2 py-1 rounded-lg text-xs font-semibold`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                {card.trend.value}
              </span>
              <span className="text-label-sm text-on-surface-variant/80">{card.trendLabel}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
