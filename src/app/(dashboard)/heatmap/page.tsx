"use client"

import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, Loader2, AlertCircle, RefreshCw } from "lucide-react"

interface HabitLog {
  id: string; habitId: string; completed: boolean; date: string
}

function getColor(count: number): string {
  if (count === 0) return "bg-surface-variant/30"
  if (count <= 3) return "bg-emerald-200 dark:bg-emerald-900/40"
  if (count <= 6) return "bg-emerald-400 dark:bg-emerald-700"
  if (count <= 9) return "bg-emerald-600 dark:bg-emerald-500"
  return "bg-emerald-800 dark:bg-emerald-400"
}

export default function HeatmapPage() {
  useEffect(() => { document.title = "Habit Heatmap — LUMARY Studio" }, [])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["habit-logs"], queryFn: () => fetch("/api/v1/habit-logs").then((r) => r.json()),
  })
  const logs: HabitLog[] = data?.items ?? []

  const dayCounts = useMemo(() => {
    const map: Record<string, number> = {}
    const completed = logs.filter((l) => l.completed)
    completed.forEach((l) => {
      const d = l.date.slice(0, 10)
      map[d] = (map[d] || 0) + 1
    })
    return map
  }, [logs])

  const weeks = useMemo(() => {
    const result: { date: string; count: number }[][] = []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const start = new Date(today); start.setDate(start.getDate() - 364)

    let week: { date: string; count: number }[] = []
    for (let i = 0; i < 365; i++) {
      const d = new Date(start); d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      week.push({ date: dateStr, count: dayCounts[dateStr] || 0 })
      if (d.getDay() === 6 || i === 364) {
        result.push(week); week = []
      }
    }
    return result
  }, [dayCounts])

  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const start = new Date(today); start.setDate(start.getDate() - 364)
    months.forEach((m, i) => {
      const targetMonth = (start.getMonth() + i) % 12
      const targetYear = start.getFullYear() + Math.floor((start.getMonth() + i) / 12)
      for (let w = 0; w < weeks.length; w++) {
        if (weeks[w].length > 0) {
          const d = new Date(weeks[w][0].date)
          if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
            labels.push({ label: m, index: w }); break
          }
        }
      }
    })
    return labels
  }, [weeks])

  const totalHabits = logs.filter((l) => l.completed).length
  const avgDaily = logs.length > 0 ? (totalHabits / 365).toFixed(1) : "0"

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load heatmap</h3><p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Activity className="w-5 h-5 text-primary" /></div>
        <div><h2 className="text-headline-lg font-bold text-on-surface">Habit Heatmap</h2><p className="text-xs text-on-surface-variant/80">{totalHabits} total habits logged · {avgDaily} avg/day</p></div>
      </div>

      {isLoading ? (
        <div className="glass-card p-card-padding space-y-3">
          <div className="h-4 w-32 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
          <div className="flex gap-1">
            {Array.from({ length: 53 }).map((_, i) => (<div key={i} className="flex gap-1 flex-col">{Array.from({ length: 7 }).map((_, j) => (<div key={j} className="w-3 h-3 rounded-sm bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />))}</div>))}
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><Activity className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No habit data yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Start tracking habits to see your heatmap</p>
        </div>
      ) : (
        <div className="glass-card p-card-padding overflow-x-auto">
          <div className="inline-flex gap-1">
            <div className="flex flex-col gap-1 pt-5 mr-1">
              {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((d, i) => (
                <div key={i} className="h-3 text-[8px] text-on-surface-variant/70 leading-3">{d}</div>
              ))}
            </div>
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                      title={`${day.date}: ${day.count} habits`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Month labels */}
          <div className="flex gap-1 ml-[22px] mt-2">
            {monthLabels.map((m) => (
              <div key={m.label} className="text-[8px] text-on-surface-variant/70" style={{ marginLeft: m.index === 0 ? 0 : undefined }}>{m.label}</div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-[10px] text-on-surface-variant/70">Less</span>
            {[0, 3, 6, 9, 10].map((v) => (<div key={v} className={`w-3 h-3 rounded-sm ${getColor(v)}`} />))}
            <span className="text-[10px] text-on-surface-variant/70">More</span>
          </div>
        </div>
      )}
    </div>
  )
}
