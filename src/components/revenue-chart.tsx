"use client"

import { usePayments } from "@/lib/api-hooks"
import type { Payment } from "@/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const fallbackRevenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 62000 },
  { month: "Mar", revenue: 58000 },
  { month: "Apr", revenue: 85000 },
  { month: "May", revenue: 124500 },
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function buildRevenueData(payments: Payment[]) {
  if (payments.length === 0) return fallbackRevenueData

  const now = new Date()
  return Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const revenue = payments
      .filter((p) => {
        const pd = new Date(p.paidAt || p.createdAt)
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
      })
      .reduce((sum, p) => sum + p.amount, 0)
    return { month: MONTHS[d.getMonth()], revenue }
  })
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/90 dark:bg-surface-container-high/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-white/40 dark:border-white/10">
      <p className="text-xs text-on-surface-variant/80 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold text-on-surface font-mono">
          TSh {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export function RevenueChart() {
  const { data: paymentsData } = usePayments()
  const payments: Payment[] = paymentsData?.items ?? []

  const revenueData = buildRevenueData(payments)

  return (
    <div className="w-full h-72 relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={revenueData}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4FACFE" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#4FACFE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#dcc1b7" vertical={false} opacity={0.3} />
          <XAxis
            dataKey="month"
            stroke="#89726a"
            tick={{ fill: "#89726a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#89726a"
            tick={{ fill: "#89726a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v / 1000}k`}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#4FACFE"
            strokeWidth={3}
            dot={{ fill: "#4FACFE", strokeWidth: 2, r: 4, stroke: "#fff" }}
            activeDot={{ r: 7, fill: "#4FACFE", stroke: "#fff", strokeWidth: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

