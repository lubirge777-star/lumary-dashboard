"use client"

import dynamic from "next/dynamic"
import { useMemo, useEffect } from "react"
import { usePayments, useProjects, useClients, useActivities } from "@/lib/api-hooks"
import { formatTSh } from "@/lib/utils"
import { ActivityFeed } from "@/components/activity-feed"
import { RelatedLinks } from "@/components/related-links"
import { AnimatedCounter } from "@/components/animated-counter"
import { TopClientsChart } from "@/components/top-clients-chart"
import { QuickActions } from "@/components/quick-actions"
import { UpcomingWidget } from "@/components/upcoming-widget"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import type { Payment, Client, Project } from "@/types"
import {
  TrendingUp, Minus, Briefcase, AlertCircle, RefreshCw, Bot, Clock, DollarSign, Users,
} from "lucide-react"

const RevenueChart = dynamic(
  () => import("@/components/revenue-chart").then((m) => ({ default: m.RevenueChart })),
  { ssr: false }
)

const ProjectStatusChart = dynamic(
  () => import("@/components/project-status-chart").then((m) => ({ default: m.ProjectStatusChart })),
  { ssr: false }
)

const KpiCard = ({
  label,
  value,
  rawValue,
  icon,
  trend,
  trendLabel,
  gradient,
  iconBg,
  iconColor,
  animate,
}: {
  label: string
  value: string
  rawValue?: number
  icon: React.ReactNode
  trend: { direction: "up" | "down" | "flat"; value: string }
  trendLabel: string
  gradient: string
  iconBg: string
  iconColor: string
  animate?: boolean
}) => {
  const TrendIcon = trend.direction === "up" ? TrendingUp : Minus
  const trendColor = trend.direction === "up"
    ? "text-emerald-600 bg-emerald-100/50 dark:text-emerald-300 dark:bg-emerald-500/15"
    : "text-primary bg-primary/10"

  return (
    <div className="glass-card p-card-padding flex flex-col relative overflow-hidden group hover:shadow-lg dark:hover:shadow-black/30 transition-shadow">
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${gradient} rounded-full opacity-10 blur-2xl group-hover:opacity-30 transition-opacity`} />
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-label-sm text-on-surface-variant opacity-70 mb-2">{label}</p>
          <h3 className="text-headline-xl text-on-surface font-bold break-words">
            {animate && rawValue !== undefined && label === "Conversion Rate" ? (
              <AnimatedCounter value={rawValue} suffix="%" decimals={1} />
            ) : animate && rawValue !== undefined ? (
              <AnimatedCounter value={rawValue} formatter={(v) => formatTSh(Math.round(v))} />
            ) : (
              value
            )}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}>
          {icon}
        </div>
      </div>
      <div className="mt-auto pt-6 flex items-center gap-2">
        <span className={`flex items-center ${trendColor} px-2 py-1 rounded-lg text-xs font-semibold`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          {trend.value}
        </span>
        <span className="text-label-sm text-on-surface-variant/80">{trendLabel}</span>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  useEffect(() => { document.title = "Overview — LUMARY Studio" }, [])
  const { data: projectsData, isLoading: projectsLoading, error: projectsError, refetch } = useProjects()
  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useClients()
  const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError } = usePayments()
  const { data: activitiesData, isLoading: activitiesLoading, error: activitiesError } = useActivities()
  const projects = ((projectsData as any)?.items ?? []) as Project[]
  const clients = ((clientsData as any)?.items ?? []) as Client[]
  const payments: Payment[] = paymentsData?.items ?? []
  const activities = (activitiesData as any)?.items ?? []

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

  const conversionRateNum = clients.length > 0
    ? ((payments.length / clients.length) * 100)
    : 0

  const needsAttention = useMemo(() => {
    const stalled = projects.filter((p) => p.daysInStage > 7 && !["PAID", "FINAL_DELIVERED", "CANCELLED"].includes(p.status))
    const unpaid = payments.filter((p) => p.status !== "PAID")
    const totalDue = unpaid.reduce((s, p) => s + p.amount, 0)
    return { stalled, unpaid, totalDue }
  }, [projects, payments])

  const loading = projectsLoading || clientsLoading || paymentsLoading || activitiesLoading
  const hasError = projectsError || clientsError || paymentsError || activitiesError

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load dashboard</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-gutter animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-card-padding space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="glass-card p-card-padding lg:col-span-7">
            <Skeleton className="h-5 w-40 mb-6" />
            <ChartSkeleton />
          </div>
          <div className="glass-card p-card-padding lg:col-span-5">
            <Skeleton className="h-5 w-36 mb-4" />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (clients.length === 0 && projects.length === 0 && payments.length === 0) {
    return (
      <div className="space-y-gutter animate-fadeIn">
        <QuickActions />
        <div className="glass-card p-card-padding">
          <EmptyState
            icon={<Briefcase className="w-7 h-7" />}
            title="Welcome to LUMARY"
            description="Start by adding your first client, then create projects and track payments. Your dashboard will populate automatically."
            action={
              <a
                href="/clients"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"
              >
                Go to Clients
              </a>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-gutter">
      {/* Quick Actions */}
      <QuickActions />

      {/* Ask Agent */}
      <a
        href="/agent"
        className="block glass-card p-card-padding bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 dark:border-primary/30 hover:border-primary/40 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-on-surface">Ask the Agent</h3>
            <p className="text-xs text-on-surface-variant/80 mt-0.5">
              Ask anything about your business, get daily scans, or run commands
            </p>
          </div>
          <span className="text-xs font-semibold text-primary shrink-0 group-hover:translate-x-1 transition-transform">
            Open Chat →
          </span>
        </div>
      </a>

      {/* Needs Attention */}
      {(needsAttention.stalled.length > 0 || needsAttention.unpaid.length > 0) && (
        <div className="space-y-3 animate-fadeIn">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide uppercase opacity-70">
            Needs Attention
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {needsAttention.stalled.length > 0 && (
              <a href="/projects" className="glass-card p-4 card-hover flex items-center gap-3 border-l-4 border-l-amber-500">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{needsAttention.stalled.length} Stalled Project{needsAttention.stalled.length > 1 ? "s" : ""}</p>
                  <p className="text-xs text-on-surface-variant/70">In stage for 7+ days — review pipeline</p>
                </div>
              </a>
            )}
            {needsAttention.unpaid.length > 0 && (
              <a href="/finance" className="glass-card p-4 card-hover flex items-center gap-3 border-l-4 border-l-red-500">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{needsAttention.unpaid.length} Unpaid Invoice{needsAttention.unpaid.length > 1 ? "s" : ""}</p>
                  <p className="text-xs text-on-surface-variant/70">{formatTSh(needsAttention.totalDue)} outstanding</p>
                </div>
              </a>
            )}
            {activeClients > 0 && (
              <a href="/clients" className="glass-card p-4 card-hover flex items-center gap-3 border-l-4 border-l-primary">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{activeClients} Active Client{activeClients > 1 ? "s" : ""}</p>
                  <p className="text-xs text-on-surface-variant/70">{newThisWeek} new this week</p>
                </div>
              </a>
            )}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter animate-fadeInUp">
        <KpiCard
          label="Monthly Revenue"
          value={formatTSh(monthlyRevenue)}
          rawValue={monthlyRevenue}
          icon={<span className="material-symbols-outlined text-[28px]">payments</span>}
          trend={{ direction: "up", value: "12.5%" }}
          trendLabel="vs last month"
          gradient="grad-orange"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          animate
        />
        <KpiCard
          label="Active Projects"
          value={activeProjects.toString()}
          rawValue={activeProjects}
          icon={<Briefcase className="w-6 h-6" />}
          trend={{ direction: "up", value: `${newThisWeek} new` }}
          trendLabel="this week"
          gradient="grad-blue"
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          animate
        />
        <KpiCard
          label="Active Clients"
          value={activeClients.toString()}
          rawValue={activeClients}
          icon={<span className="material-symbols-outlined text-[28px]">group</span>}
          trend={{ direction: "flat", value: "Stable" }}
          trendLabel="vs last month"
          gradient="grad-purple"
          iconBg="bg-tertiary/10"
          iconColor="text-tertiary"
          animate
        />
        <KpiCard
          label="Conversion Rate"
          value={`${conversionRateNum.toFixed(1)}%`}
          rawValue={conversionRateNum}
          icon={<span className="material-symbols-outlined text-[28px]">insights</span>}
          trend={{ direction: "up", value: "2.1%" }}
          trendLabel="vs last month"
          gradient="grad-green"
          iconBg="bg-emerald-500/10 dark:bg-emerald-500/20"
          iconColor="text-emerald-600 dark:text-emerald-300"
          animate
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Revenue Trend */}
        <div className="glass-card p-card-padding lg:col-span-7 animate-fadeInUp delay-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-headline-md font-bold text-on-surface">Revenue Trend</h3>
            <select className="bg-surface-variant/50 border-none rounded-xl text-sm font-semibold text-on-surface-variant px-4 py-2 focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <RevenueChart />
        </div>

        {/* Project Status */}
        <div className="glass-card p-card-padding lg:col-span-5 animate-fadeInUp delay-150">
          <h3 className="text-headline-md font-bold text-on-surface mb-4">Project Status</h3>
          <ProjectStatusChart />
        </div>
      </div>

      {/* Third Row: Top Clients + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter animate-fadeInUp delay-200">
        {/* Top Clients */}
        <div className="glass-card p-card-padding lg:col-span-5">
          <h3 className="text-headline-md font-bold text-on-surface mb-4">Top Clients by Revenue</h3>
          <TopClientsChart />
        </div>

        {/* Upcoming */}
        <div className="glass-card p-card-padding lg:col-span-4">
          <h3 className="text-headline-md font-bold text-on-surface mb-4">Upcoming</h3>
          <UpcomingWidget />
        </div>

        {/* Pipeline Value */}
        <div className="glass-card p-card-padding lg:col-span-3 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 grad-purple rounded-full opacity-10 blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-headline-md font-bold text-on-surface mb-2">Pipeline Value</h3>
            <p className="text-xs text-on-surface-variant/70 mb-6">
              Estimated value of pending deals.
            </p>
            <div className="text-4xl font-bold text-on-surface mb-6 tracking-tight break-words">
              {formatTSh(
                projects
                  .filter((p) => !["PAID", "FINAL_DELIVERED"].includes(p.status))
                  .reduce((s, p) => s + p.quotedAmount, 0)
              )}
            </div>
            <div className="space-y-3">
              <div className="w-full bg-surface-variant/50 h-2.5 rounded-full overflow-hidden">
                <div className="w-[75%] h-full grad-purple rounded-full shadow-lg" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary">75% to Q3 Goal</span>
                <span className="text-[10px] font-semibold text-on-surface-variant/70 uppercase tracking-widest">
                  {formatTSh(projects.reduce((s, p) => s + p.quotedAmount, 0) * 1.33)} Goal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="glass-card p-card-padding animate-fadeInUp delay-300 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-headline-md font-bold text-on-surface">Recent Activity</h3>
          <button className="text-sm font-bold text-primary px-4 py-2 hover:bg-primary/5 rounded-xl transition-all">
            View All Activity
          </button>
        </div>
        <ActivityFeed />
      </div>

      <RelatedLinks
        title="Quick Access"
        links={[
          { label: "Agent", href: "/agent", description: "Ask AI anything" },
          { label: "Clients", href: "/clients" },
          { label: "Pipeline", href: "/projects" },
          { label: "Messages", href: "/messages" },
          { label: "Finance", href: "/finance" },
          { label: "Calendar", href: "/calendar" },
          { label: "Agent Cron", href: "/agent?tab=cron", description: "Daily scan" },
        ]}
      />
    </div>
  )
}
