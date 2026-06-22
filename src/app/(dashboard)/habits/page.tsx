"use client"

import { useState, useMemo, useEffect, useCallback, Suspense } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import {
  CheckCircle2, Moon, BookOpen, Brain, MessageSquare, Code,
  Activity, Heart, PenLine, Loader2, AlertCircle, RefreshCw, Flame,
  Clock, TimerIcon,
} from "lucide-react"
import clsx from "clsx"

const HABIT_DEFS = [
  { id: "fajr", name: "Fajr on time", icon: Moon },
  { id: "quran", name: "Quran 1 page", icon: BookOpen },
  { id: "exercise", name: "Exercise / walk", icon: Activity },
  { id: "arabic", name: "Arabic 30 min", icon: MessageSquare },
  { id: "code", name: "Code 1.5 hrs", icon: Code },
  { id: "ai-tool", name: "AI tool 10 min", icon: Brain },
  { id: "reading", name: "Reading 20 min", icon: BookOpen },
  { id: "connect-mary", name: "Connect with Mary", icon: Heart },
  { id: "journal", name: "Journal entry", icon: PenLine },
  { id: "sleep", name: "Sleep by 22:00", icon: Moon },
]

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function formatDate(d: Date) { return d.toISOString().slice(0, 10) }

function getDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yest."
  return days[d.getDay()]
}

function getColor(count: number): string {
  if (count === 0) return "bg-surface-variant/30"
  if (count <= 3) return "bg-emerald-200 dark:bg-emerald-900/40"
  if (count <= 6) return "bg-emerald-400 dark:bg-emerald-700"
  if (count <= 9) return "bg-emerald-600 dark:bg-emerald-500"
  return "bg-emerald-800 dark:bg-emerald-400"
}

const TABS = [
  { key: "today", label: "Today" },
  { key: "heatmap", label: "Heatmap" },
]

function TodayTab({
  existingHabits, todayLogs, habitMap, logSet, toggleMutation,
}: {
  existingHabits: Record<string, unknown>[]
  todayLogs: Record<string, unknown>[]
  habitMap: Map<string, Record<string, unknown>>
  logSet: Set<string>
  toggleMutation: any
}) {
  const doneCount = todayLogs.filter((l) => l.completed).length
  const totalHabits = HABIT_DEFS.length
  const progressPct = totalHabits ? (doneCount / totalHabits) * 100 : 0

  const weeklyData = useMemo(() => {
    const days: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(TODAY); d.setDate(d.getDate() - i)
      const dateStr = formatDate(d)
      let count = 0
      for (const habit of existingHabits) {
        const logs = (habit as any).logs ?? []
        const logged = logs.find((l: any) => formatDate(new Date(l.date)) === dateStr && l.completed)
        if (logged) count++
      }
      days.push({ date: dateStr, count })
    }
    return days
  }, [existingHabits])

  const streak = useMemo(() => {
    let streakCount = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date(TODAY); d.setDate(d.getDate() - i)
      const dateStr = formatDate(d)
      let count = 0
      for (const habit of existingHabits) {
        const logs = (habit as any).logs ?? []
        const logged = logs.find((l: any) => formatDate(new Date(l.date)) === dateStr && l.completed)
        if (logged) count++
      }
      if (count >= 8) streakCount++
      else break
    }
    return streakCount
  }, [existingHabits])

  const maxWeeklyCount = Math.max(...weeklyData.map((d) => d.count), 1)

  const handleToggle = useCallback(
    (habitName: string) => {
      const habit = habitMap.get(habitName) as Record<string, unknown> | undefined
      if (!habit) return
      const isDone = logSet.has(habit.id as string)
      toggleMutation.mutate({ habitId: habit.id as string, completed: !isDone })
    },
    [habitMap, logSet, toggleMutation]
  )

  return (
    <div className="space-y-6 stagger-children">
      {/* Progress + Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-card-padding md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide">Today&rsquo;s Progress</h3>
            <span className="text-sm font-semibold font-mono text-primary">{doneCount}/{totalHabits}</span>
          </div>
          <div className="h-3 rounded-full bg-surface-variant/50 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant/80 mt-2">
            {doneCount === totalHabits ? "All habits completed! Amazing day." : `${totalHabits - doneCount} more to go`}
          </p>
        </div>

        <div className="glass-card p-card-padding flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 grad-orange rounded-full opacity-10 blur-2xl" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 relative z-10">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-on-surface-variant/80 font-medium uppercase tracking-wider">Streak</p>
            <p className="text-2xl font-bold font-heading text-on-surface mt-0.5">
              {streak} {streak === 1 ? "day" : "days"}
            </p>
            <p className="text-xs text-on-surface-variant/80 mt-0.5">
              {streak === 0 ? "Complete 8+ habits to start a streak" : streak >= 7 ? "On fire! Keep it going." : "Stay consistent!"}
            </p>
          </div>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {HABIT_DEFS.map((habit, i) => {
          const dbHabit = habitMap.get(habit.name) as Record<string, unknown> | undefined
          const isDone = dbHabit ? logSet.has(dbHabit.id as string) : false
          const Icon = habit.icon
          return (
            <button
              key={habit.id}
              onClick={() => handleToggle(habit.name)}
              disabled={toggleMutation.isPending}
              className={clsx(
                "glass-card p-5 text-left card-hover relative overflow-hidden transition-all group",
                isDone ? "ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10" : "hover:ring-1 hover:ring-primary/20",
                toggleMutation.isPending && "pointer-events-none opacity-60"
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={clsx("absolute inset-0 opacity-0 transition-opacity duration-500", isDone && "opacity-100")}>
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-emerald-500 rounded-full blur-3xl opacity-20" />
              </div>
              <div className="relative z-10">
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300", isDone ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400" : "bg-primary/5 text-on-surface-variant/80 group-hover:bg-primary/10 group-hover:text-primary")}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <p className={clsx("text-sm font-medium leading-tight transition-colors", isDone ? "text-emerald-700 dark:text-emerald-300" : "text-on-surface")}>
                  {habit.name}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Weekly Overview */}
      <div className="glass-card p-card-padding">
        <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2 mb-6">
          <Activity className="w-4 h-4 text-primary" />
          Weekly Overview
        </h3>
        {weeklyData.some((d) => d.count > 0) ? (
          <div className="flex items-end gap-3 h-40">
            {weeklyData.map((day) => {
              const barHeight = maxWeeklyCount > 0 ? (day.count / maxWeeklyCount) * 100 : 0
              const isToday = day.date === formatDate(TODAY)
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-semibold font-mono text-on-surface-variant/80">{day.count}</span>
                  <div className={clsx("w-full rounded-lg transition-all duration-500 relative group cursor-pointer", isToday ? "bg-primary" : day.count >= 8 ? "bg-emerald-500" : "bg-surface-variant/70")} style={{ height: `${Math.max(barHeight, 4)}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-high text-on-surface text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">{day.count} habits</div>
                  </div>
                  <span className={clsx("text-[10px] font-semibold", isToday ? "text-primary" : "text-on-surface-variant/70")}>{getDayLabel(day.date)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-4"><Activity className="w-6 h-6 text-on-surface-variant/80" /></div>
            <p className="text-sm font-medium text-on-surface mb-1">No data this week</p>
            <p className="text-xs text-on-surface-variant/80">Start tracking your habits to see weekly trends</p>
          </div>
        )}
      </div>

      {/* Goal Card */}
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/30 dark:to-surface-container-high border border-amber-200/50 dark:border-amber-700/30 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0"><Flame className="w-6 h-6 text-amber-600" /></div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-1">Daily Goal: 8/10 habits</h3>
            <p className="text-sm text-on-surface-variant/70 leading-relaxed">Complete at least 8 out of 10 habits daily to maintain your streak. Consistency over perfection &mdash; every day counts.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeatmapTab({ logs }: { logs: Record<string, unknown>[] }) {
  const dayCounts = useMemo(() => {
    const map: Record<string, number> = {}
    const completed = logs.filter((l) => l.completed)
    completed.forEach((l: any) => {
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
      if (d.getDay() === 6 || i === 364) { result.push(week); week = [] }
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
          if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) { labels.push({ label: m, index: w }); break }
        }
      }
    })
    return labels
  }, [weeks])

  const totalHabits = logs.filter((l) => l.completed).length
  const avgDaily = logs.length > 0 ? (totalHabits / 365).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <p className="text-sm text-on-surface-variant/80">{totalHabits} total habits logged · {avgDaily} avg/day</p>

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
                  <div key={day.date} className={`w-3 h-3 rounded-sm ${getColor(day.count)}`} title={`${day.date}: ${day.count} habits`} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1 ml-[22px] mt-2">
          {monthLabels.map((m) => (
            <div key={m.label} className="text-[8px] text-on-surface-variant/70" style={{ marginLeft: m.index === 0 ? 0 : undefined }}>{m.label}</div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-[10px] text-on-surface-variant/70">Less</span>
          {[0, 3, 6, 9, 10].map((v) => (<div key={v} className={`w-3 h-3 rounded-sm ${getColor(v)}`} />))}
          <span className="text-[10px] text-on-surface-variant/70">More</span>
        </div>
      </div>
    </div>
  )
}

const TimerContent = dynamic(
  () => import("@/app/(dashboard)/timer/page"),
  { ssr: false, loading: () => <TabSkeleton /> }
)

const FocusContent = dynamic(
  () => import("@/app/(dashboard)/focus/page"),
  { ssr: false, loading: () => <TabSkeleton /> }
)

const OUTER_TABS = [
  { key: "habits", label: "Habits", icon: CheckCircle2 },
  { key: "timer", label: "Timer", icon: TimerIcon },
  { key: "focus", label: "Focus", icon: Clock },
]

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-shimmer h-28 rounded-2xl bg-surface-container-low" />
      ))}
    </div>
  )
}

function HabitsContent() {
  const [activeTab, setActiveTab] = useState("today")
  const queryClient = useQueryClient()

  const { data: habitsResp, isLoading: habitsLoading } = useQuery({
    queryKey: ["habits"], queryFn: () => fetch("/api/v1/habits").then((r) => r.json()),
  })

  const { data: logsResp, isLoading: logsLoading, error: logsError, refetch } = useQuery({
    queryKey: ["habit-logs", "today"], queryFn: () => fetch("/api/v1/habit-logs").then((r) => r.json()),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: string; completed: boolean }) =>
      fetch("/api/v1/habit-logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ habitId, completed }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["habit-logs"] }); queryClient.invalidateQueries({ queryKey: ["habits"] }) },
  })

  const existingHabits: Record<string, unknown>[] = habitsResp?.items ?? []
  const todayLogs: Record<string, unknown>[] = logsResp?.items ?? []

  const habitMap = useMemo(() => new Map<string, Record<string, unknown>>(existingHabits.map((h) => [h.name as string, h])), [existingHabits])
  const logSet = useMemo(() => new Set<string>(todayLogs.filter((l) => (l as any).completed).map((l) => (l as any).habitId as string)), [todayLogs])

  const loading = habitsLoading || logsLoading

  if (logsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load habits</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-20 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Daily Habits</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Track your daily routine and build consistency</p>
        </div>
      </div>

      {/* Inner sub-tabs: Today / Heatmap */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-variant/50 w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                isActive ? "bg-white dark:bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface-variant/80 hover:text-on-surface"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "today" ? (
        <TodayTab existingHabits={existingHabits} todayLogs={todayLogs} habitMap={habitMap} logSet={logSet} toggleMutation={toggleMutation} />
      ) : (
        <HeatmapTab logs={todayLogs} />
      )}
    </div>
  )
}

function HabitsPageTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const tab = searchParams.get("tab") || "habits"

  useEffect(() => {
    const titles: Record<string, string> = {
      habits: "Habits",
      timer: "Timer",
      focus: "Focus Analytics",
    }
    document.title = `${titles[tab] || "Habits"} — LUMARY Studio`
  }, [tab])

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex gap-1 p-1 rounded-xl bg-surface-variant/50 w-fit">
        {OUTER_TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("tab", t.key)
                router.replace(`${pathname}?${params.toString()}`, { scroll: false })
              }}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === t.key
                  ? "bg-white dark:bg-surface-container-high text-on-surface shadow-sm"
                  : "text-on-surface-variant/80 hover:text-on-surface"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === "habits" && <HabitsContent />}
      {tab === "timer" && <TimerContent />}
      {tab === "focus" && <FocusContent />}
    </div>
  )
}

export default function HabitsPage() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <HabitsPageTabs />
    </Suspense>
  )
}
