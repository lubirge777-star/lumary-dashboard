"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2, Moon, BookOpen, Brain, MessageSquare, Code,
  Activity, Heart, PenLine, Loader2, AlertCircle, RefreshCw, Flame,
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

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function getDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yest."
  return days[d.getDay()]
}

export default function HabitsPage() {
  useEffect(() => { document.title = "Habits \u2014 LUMARY Studio" }, [])
  const queryClient = useQueryClient()

  const { data: habitsResp, isLoading: habitsLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: () => fetch("/api/v1/habits").then((r) => r.json()),
  })

  const { data: logsResp, isLoading: logsLoading, error: logsError, refetch } = useQuery({
    queryKey: ["habit-logs", "today"],
    queryFn: () => fetch("/api/v1/habit-logs").then((r) => r.json()),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: string; completed: boolean }) =>
      fetch("/api/v1/habit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, completed }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-logs"] })
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })

  const existingHabits: Record<string, unknown>[] = habitsResp?.items ?? []
  const todayLogs: Record<string, unknown>[] = logsResp?.items ?? []

  const habitMap = useMemo(
    () => new Map(existingHabits.map((h: Record<string, unknown>) => [h.name, h])),
    [existingHabits]
  )

  const logSet = useMemo(
    () => new Set(todayLogs.filter((l: Record<string, unknown>) => l.completed).map((l: Record<string, unknown>) => l.habitId)),
    [todayLogs]
  )

  const doneCount = todayLogs.filter((l: Record<string, unknown>) => l.completed).length
  const totalHabits = HABIT_DEFS.length
  const progressPct = totalHabits ? (doneCount / totalHabits) * 100 : 0

  const weeklyData = useMemo(() => {
    const days: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(TODAY)
      d.setDate(d.getDate() - i)
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
      const d = new Date(TODAY)
      d.setDate(d.getDate() - i)
      const dateStr = formatDate(d)
      let count = 0
      for (const habit of existingHabits) {
        const logs = (habit as any).logs ?? []
        const logged = logs.find((l: any) => formatDate(new Date(l.date)) === dateStr && l.completed)
        if (logged) count++
      }
      if (count >= 8) {
        streakCount++
      } else {
        break
      }
    }
    return streakCount
  }, [existingHabits])

  const maxWeeklyCount = Math.max(...weeklyData.map((d) => d.count), 1)

  const handleToggle = useCallback(
    (habitName: string) => {
      const habit = habitMap.get(habitName) as Record<string, unknown> | undefined
      if (!habit) return
      const isDone = logSet.has(habit.id)
      toggleMutation.mutate({ habitId: habit.id as string, completed: !isDone })
    },
    [habitMap, logSet, toggleMutation]
  )

  const loading = habitsLoading || logsLoading
  const hasError = logsError

  const loadingBarHeights = useMemo(
    () => Array.from({ length: 7 }, () => `${40 + Math.floor(Math.random() * 60)}%`),
    []
  )

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load habits</h3>
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
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-20 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
            </div>
          ))}
        </div>
        <div className="glass-card p-card-padding">
          <div className="h-4 w-32 mb-6 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
          <div className="flex items-end gap-3 h-32">
            {loadingBarHeights.map((h, i) => (
              <div key={i} className="flex-1 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" style={{ height: h }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (existingHabits.length === 0) {
    return (
      <div className="space-y-6 stagger-children">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Daily Habits</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Seeding your habits for the first time&hellip;</p>
        </div>
        <div className="glass-card p-card-padding flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-base font-semibold text-on-surface mb-1">Setting up habits</h3>
            <p className="text-sm text-on-surface-variant/70">Creating your habit list for the first time&hellip;</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-on-surface">Daily Habits</h1>
        <p className="text-sm text-on-surface-variant/80 mt-1">
          Track your daily routine and build consistency
        </p>
      </div>

      {/* Progress + Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-card-padding md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide">Today&rsquo;s Progress</h3>
            <span className="text-sm font-semibold font-mono text-primary">
              {doneCount}/{totalHabits}
            </span>
          </div>
          <div className="h-3 rounded-full bg-surface-variant/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-on-surface-variant/80 mt-2">
            {doneCount === totalHabits
              ? "All habits completed! Amazing day."
              : `${totalHabits - doneCount} more to go`}
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
              {streak === 0
                ? "Complete 8+ habits to start a streak"
                : streak >= 7
                  ? "On fire! Keep it going."
                  : "Stay consistent!"}
            </p>
          </div>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {HABIT_DEFS.map((habit, i) => {
          const dbHabit = habitMap.get(habit.name) as Record<string, unknown> | undefined
          const isDone = dbHabit ? logSet.has(dbHabit.id) : false
          const Icon = habit.icon
          return (
            <button
              key={habit.id}
              onClick={() => handleToggle(habit.name)}
              disabled={toggleMutation.isPending}
              className={clsx(
                "glass-card p-5 text-left card-hover relative overflow-hidden transition-all group",
                isDone
                  ? "ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "hover:ring-1 hover:ring-primary/20",
                toggleMutation.isPending && "pointer-events-none opacity-60"
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={clsx(
                "absolute inset-0 opacity-0 transition-opacity duration-500",
                isDone && "opacity-100"
              )}>
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-emerald-500 rounded-full blur-3xl opacity-20" />
              </div>
              <div className="relative z-10">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                  isDone
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                    : "bg-primary/5 text-on-surface-variant/80 group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <p className={clsx(
                  "text-sm font-medium leading-tight transition-colors",
                  isDone
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-on-surface"
                )}>
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
                  <span className="text-xs font-semibold font-mono text-on-surface-variant/80">
                    {day.count}
                  </span>
                  <div
                    className={clsx(
                      "w-full rounded-lg transition-all duration-500 relative group cursor-pointer",
                      isToday ? "bg-primary" : day.count >= 8 ? "bg-emerald-500" : "bg-surface-variant/70"
                    )}
                    style={{ height: `${Math.max(barHeight, 4)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-high text-on-surface text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                      {day.count} habits
                    </div>
                  </div>
                  <span className={clsx(
                    "text-[10px] font-semibold",
                    isToday ? "text-primary" : "text-on-surface-variant/70"
                  )}>
                    {getDayLabel(day.date)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-on-surface-variant/80" />
            </div>
            <p className="text-sm font-medium text-on-surface mb-1">No data this week</p>
            <p className="text-xs text-on-surface-variant/80">Start tracking your habits to see weekly trends</p>
          </div>
        )}
      </div>

      {/* Goal Card */}
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/30 dark:to-surface-container-high border border-amber-200/50 dark:border-amber-700/30 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-1">Daily Goal: 8/10 habits</h3>
            <p className="text-sm text-on-surface-variant/70 leading-relaxed">
              Complete at least 8 out of 10 habits daily to maintain your streak.
              Consistency over perfection &mdash; every day counts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
