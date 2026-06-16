"use client"

import { useMemo } from "react"
import { useProjects } from "@/lib/api-hooks"
import type { Project } from "@/types"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

const COLORS = ["#9d4319", "#00629f", "#7e35ca", "#e8913a", "#2e7d32", "#ba1a1a"]

const STATUS_LABELS: Record<string, string> = {
  LEAD: "Lead",
  QUOTED: "Quoted",
  NEGOTIATION: "Negotiation",
  DEPOSIT_PAID: "Deposit Paid",
  IN_PROGRESS: "In Progress",
  FINAL_DELIVERED: "Final Delivered",
  PAID: "Paid",
}

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white/90 dark:bg-surface-container-high/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-white/40 dark:border-white/10">
      <p className="text-xs font-semibold text-on-surface">{d.name}</p>
      <p className="text-sm font-bold text-primary font-mono mt-1">
        {d.payload.count} projects ({d.payload.percent}%)
      </p>
    </div>
  )
}

export function ProjectStatusChart() {
  const { data: projectsData } = useProjects()
  const projects: Project[] = ((projectsData as any)?.items ?? []) as Project[]

  const data = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach((p) => {
      const key = STATUS_LABELS[p.status] || p.status
      counts[key] = (counts[key] || 0) + 1
    })
    const total = projects.length
    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        count: value,
        percent: total > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [projects])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-on-surface-variant/70">
        No projects yet
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-on-surface-variant">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

