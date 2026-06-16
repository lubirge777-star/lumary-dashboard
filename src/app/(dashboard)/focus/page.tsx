"use client"

import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Clock, Loader2, AlertCircle, RefreshCw, TrendingUp, Calendar, Zap } from "lucide-react"
import clsx from "clsx"

interface Session {
  id: string; mode: string; duration: number; completed: boolean; createdAt: string
}

export default function FocusPage() {
  useEffect(() => { document.title = "Focus Analytics — LUMARY Studio" }, [])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["timer-sessions"], queryFn: () => fetch("/api/v1/timer-sessions").then((r) => r.json()),
  })
  const sessions: Session[] = data?.items ?? []

  const now = new Date()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.completed && s.mode === "focus")
    const thisWeek = completed.filter((s) => new Date(s.createdAt) >= weekStart)
    const thisMonth = completed.filter((s) => new Date(s.createdAt) >= monthStart)
    const weekHours = thisWeek.reduce((s, sess) => s + sess.duration, 0) / 60
    const monthHours = thisMonth.reduce((s, sess) => s + sess.duration, 0) / 60

    const dayMap: Record<string, number> = {}
    completed.forEach((s) => {
      const d = new Date(s.createdAt).toDateString()
      dayMap[d] = (dayMap[d] || 0) + s.duration
    })
    const dayHours = Object.values(dayMap).map((m) => m / 60)
    const avgDay = dayHours.length ? dayHours.reduce((a, b) => a + b, 0) / dayHours.length : 0
    const bestDay = dayHours.length ? Math.max(...dayHours) : 0

    // Daily chart data
    const chartData: { day: string; hours: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      const ds = d.toDateString()
      const h = (dayMap[ds] || 0) / 60
      chartData.push({ day: d.toLocaleDateString("en", { weekday: "short" }), hours: Math.round(h * 10) / 10 })
    }
    return { weekHours: Math.round(weekHours * 10) / 10, monthHours: Math.round(monthHours * 10) / 10, avgDay: Math.round(avgDay * 10) / 10, bestDay: Math.round(bestDay * 10) / 10, chartData }
  }, [sessions])

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load focus data</h3>
        <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div>
        <h2 className="text-headline-lg font-bold text-on-surface">Focus Analytics</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="glass-card p-card-padding flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Calendar className="w-6 h-6 text-primary" /></div>
          <div><p className="text-xs text-on-surface-variant/80">This Week</p>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mt-1" /> : <p className="text-xl font-bold text-on-surface">{stats.weekHours}h</p>}
          </div>
        </div>
        <div className="glass-card p-card-padding flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center"><Calendar className="w-6 h-6 text-secondary" /></div>
          <div><p className="text-xs text-on-surface-variant/80">This Month</p>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mt-1" /> : <p className="text-xl font-bold text-on-surface">{stats.monthHours}h</p>}
          </div>
        </div>
        <div className="glass-card p-card-padding flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-tertiary" /></div>
          <div><p className="text-xs text-on-surface-variant/80">Avg / Day</p>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mt-1" /> : <p className="text-xl font-bold text-on-surface">{stats.avgDay}h</p>}
          </div>
        </div>
        <div className="glass-card p-card-padding flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center"><Zap className="w-6 h-6 text-amber-600" /></div>
          <div><p className="text-xs text-on-surface-variant/80">Best Day</p>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mt-1" /> : <p className="text-xl font-bold text-on-surface">{stats.bestDay}h</p>}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-card-padding">
        <h3 className="text-sm font-semibold text-on-surface mb-6">This Week's Focus Hours</h3>
        {isLoading ? (
          <div className="flex items-end gap-2 h-48">
            {Array.from({ length: 7 }).map((_, i) => (<div key={i} className="flex-1 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" style={{ height: `${40 + Math.random() * 60}%` }} />))}
          </div>
        ) : stats.chartData.every((d) => d.hours === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-4"><Clock className="w-6 h-6 text-on-surface-variant/80" /></div>
            <p className="text-sm font-medium text-on-surface mb-1">No focus sessions this week</p>
            <p className="text-xs text-on-surface-variant/80">Start the timer to see your focus analytics</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.chartData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} unit="h" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-high)" }} />
              <Bar dataKey="hours" radius={[8, 8, 0, 0]} fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Session Log */}
      <div className="glass-card p-card-padding">
        <h3 className="text-sm font-semibold text-on-surface mb-4">Session Log</h3>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-10 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />))}</div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-4"><Clock className="w-6 h-6 text-on-surface-variant/80" /></div>
            <p className="text-sm font-medium text-on-surface mb-1">No sessions yet</p>
            <p className="text-xs text-on-surface-variant/80">Your completed focus sessions will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...sessions].reverse().slice(0, 20).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className={clsx("w-2 h-2 rounded-full", s.completed ? "bg-emerald-500" : "bg-rose-400")} />
                  <span className="text-xs font-medium text-on-surface capitalize">{s.mode}</span>
                  <span className="text-xs text-on-surface-variant/80">{s.duration} min</span>
                </div>
                <span className="text-[11px] text-on-surface-variant/70">{new Date(s.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
