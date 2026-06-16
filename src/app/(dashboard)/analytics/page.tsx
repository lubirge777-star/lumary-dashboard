"use client"

import { useEffect, useState } from "react"
import { useClients, usePayments, useProjects } from "@/lib/api-hooks"
import type { Client, Payment, Project } from "@/types"
import dynamic from "next/dynamic"
import { AlertCircle, RefreshCw, Loader2, BarChart3 } from "lucide-react"
import { Skeleton, ChartSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false })
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false })
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false })
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false })
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false })

const COLORS = ["#9d4319", "#00629f", "#7e35ca", "#ba1a1a", "#43E97B", "#4FACFE"]

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/90 dark:bg-surface-container-high/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-white/10 px-4 py-3">
      <p className="text-xs text-on-surface-variant/80 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold text-on-surface font-mono">
          {p.name === "count" ? `${p.value} clients` : `TSh ${p.value.toLocaleString()}`}
        </p>
      ))}
    </div>
  )
}

function ChartContainer({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-[260px]" />
  return <>{children}</>
}

export default function AnalyticsPage() {
  useEffect(() => { document.title = "Analytics — LUMARY Studio" }, [])
  const { data: clientsResp, isLoading: clientsLoading, error: clientsError, refetch } = useClients()
  const { data: paymentsResp, isLoading: paymentsLoading, error: paymentsError } = usePayments()
  const { data: projectsResp, isLoading: projectsLoading, error: projectsError } = useProjects()
  const clients = ((clientsResp as any)?.items ?? []) as Client[]
  const payments = ((paymentsResp as any)?.items ?? []) as Payment[]
  const projects = ((projectsResp as any)?.items ?? []) as Project[]

  const sourceData = clients.reduce<Record<string, { count: number; revenue: number }>>((acc, c) => {
    const src = c.referralSource || "Unknown"
    if (!acc[src]) acc[src] = { count: 0, revenue: 0 }
    acc[src].count++
    acc[src].revenue += c.totalSpent
    return acc
  }, {})

  const sourceChart = Object.entries(sourceData).map(([name, v]) => ({ name, ...v }))

  const serviceData = projects.reduce<Record<string, number>>((acc, p) => {
    const s = p.serviceType
    acc[s] = (acc[s] || 0) + p.quotedAmount
    return acc
  }, {})

  const serviceChart = Object.entries(serviceData).map(([name, value]) => ({ name, value }))

  const clientBreakdown = clients.map((c) => ({
    name: c.name,
    spent: c.totalSpent,
    status: c.status,
  }))

  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0)

  const loading = clientsLoading || paymentsLoading || projectsLoading
  const hasError = clientsError || paymentsError || projectsError

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load analytics</h3>
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
      <div className="space-y-6 stagger-children animate-fadeIn">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6">
            <Skeleton className="h-4 w-36 mb-6" />
            <ChartSkeleton />
          </div>
          <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6">
            <Skeleton className="h-4 w-36 mb-6" />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (clients.length === 0 && projects.length === 0 && payments.length === 0) {
    return (
      <div className="space-y-6 stagger-children animate-fadeIn">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Analytics</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Client acquisition &amp; service performance</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6">
          <EmptyState
            icon={<BarChart3 className="w-7 h-7" />}
            title="No data yet"
            description="Analytics will appear once you add clients, projects, and payments."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-on-surface">Analytics</h1>
        <p className="text-sm text-on-surface-variant/80 mt-1">Client acquisition &amp; service performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6 card-hover">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-6">Clients by Source</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sourceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dcc1b7" vertical={false} />
                <XAxis dataKey="name" stroke="#dcc1b7" tick={{ fill: "#89726a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#dcc1b7" tick={{ fill: "#89726a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#9d4319" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6 card-hover">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-6">Revenue by Service</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={serviceChart} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {serviceChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {serviceChart.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-on-surface-variant">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6 card-hover">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-6">Client Lifetime Value</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={clientBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dcc1b7" vertical={false} />
                <XAxis dataKey="name" stroke="#dcc1b7" tick={{ fill: "#89726a", fontSize: 11 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#dcc1b7" tick={{ fill: "#89726a", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="spent" fill="#9d4319" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6">
        <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-5">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Clients", value: clients.length.toString(), color: "text-on-surface" },
            { label: "Total Projects", value: projects.length.toString(), color: "text-on-surface" },
            { label: "Revenue (paid)", value: `TSh ${totalRevenue.toLocaleString()}`, color: "text-primary" },
            { label: "Avg LTV", value: `TSh ${clients.length ? Math.round(clients.reduce((s, c) => s + c.totalSpent, 0) / clients.length).toLocaleString() : 0}`, color: "text-emerald-600" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/20 dark:border-white/5">
              <p className="text-xs text-on-surface-variant/80 font-medium uppercase tracking-wider">{stat.label}</p>
              <p className={`text-xl font-semibold font-mono mt-1.5 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
