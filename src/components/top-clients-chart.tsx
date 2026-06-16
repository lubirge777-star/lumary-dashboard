"use client"

import { useMemo } from "react"
import { usePayments, useClients } from "@/lib/api-hooks"
import { formatTSh } from "@/lib/utils"
import type { Payment, Client } from "@/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/90 dark:bg-surface-container-high/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-white/40 dark:border-white/10">
      <p className="text-xs text-on-surface-variant/80 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold text-on-surface font-mono">
          {formatTSh(p.value)}
        </p>
      ))}
    </div>
  )
}

export function TopClientsChart() {
  const { data: paymentsData } = usePayments()
  const { data: clientsData } = useClients()
  const payments: Payment[] = paymentsData?.items ?? []
  const clients: Client[] = (clientsData as any)?.items ?? []

  const data = useMemo(() => {
    const byClient: Record<string, number> = {}
    payments
      .filter((p) => p.status === "PAID")
      .forEach((p) => {
        const name = p.clientName || p.clientId || "Unknown"
        byClient[name] = (byClient[name] || 0) + p.amount
      })

    return Object.entries(byClient)
      .map(([name, revenue]) => ({ name: name.length > 12 ? name.slice(0, 12) + "..." : name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
  }, [payments, clients])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-on-surface-variant/70">
        No payment data yet
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dcc1b7" horizontal={false} opacity={0.3} />
          <XAxis type="number" tick={{ fill: "#89726a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#89726a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="revenue" fill="#9d4319" radius={[0, 6, 6, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

