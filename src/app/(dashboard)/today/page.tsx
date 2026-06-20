"use client"

import { useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Sun, Moon, Target, CheckSquare, TrendingUp,
  Clock, AlertCircle, Zap, BookOpen, Star, ArrowRight, Sparkles,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { generateNudges, type Nudge } from "@/lib/nudges"
import { formatTSh, formatRelativeDate } from "@/lib/utils"

function useBriefing() {
  return useQuery({
    queryKey: ["today-briefing"],
    queryFn: async () => {
      const res = await fetch("/api/v1/today/briefing")
      if (!res.ok) throw new Error("Failed to load briefing")
      return res.json()
    },
    refetchInterval: 120000,
  })
}

function useConfig() {
  return useQuery({
    queryKey: ["user-config"],
    queryFn: async () => {
      const res = await fetch("/api/v1/user-config")
      return res.json()
    },
  })
}

function NudgeCard({ nudge, onDismiss }: { nudge: Nudge; onDismiss: (id: string) => void }) {
  const colors = {
    high: "bg-error/10 border-error/20 text-error",
    medium: "bg-secondary-container/10 border-secondary-container/30 text-secondary",
    low: "bg-surface-variant/30 border-outline-variant/30 text-on-surface-variant",
  }
  const icons = {
    habit: CheckSquare, goal: Target, focus: Zap,
    review: Clock, payment: TrendingUp, evening: Moon, milestone: Star,
  }
  const Icon = icons[nudge.type]

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${colors[nudge.severity]}`}>
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm">{nudge.message}</p>
        {nudge.action && (
          <Link
            href={nudge.action.href}
            className="inline-flex items-center gap-1 text-xs font-bold mt-1.5 hover:underline"
          >
            {nudge.action.label} <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <button onClick={() => onDismiss(nudge.id)} className="text-on-surface-variant/50 hover:text-on-surface-variant shrink-0">
        <span className="text-lg leading-none">&times;</span>
      </button>
    </div>
  )
}

function EditableField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">{label}</p>
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const v = e.currentTarget.textContent?.trim()
          if (v && v !== value) onSave(v)
        }}
        className="text-sm text-on-surface leading-relaxed outline-none focus:bg-surface-variant/30 rounded-lg px-2 -mx-2 py-1 transition-colors"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  )
}

function GoalHierarchy({ goals }: { goals: { level: string; title: string }[] }) {
  const levels = ["dream", "year10", "year", "quarter", "month", "week", "today"]
  const filtered = levels
    .map((l) => goals.find((g) => g.level === l))
    .filter(Boolean) as { level: string; title: string }[]

  if (filtered.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider mb-2">Goal Cascade</p>
      {filtered.map((g, i) => (
        <div key={g.level} className="flex items-start gap-2">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-2 h-2 rounded-full bg-primary/60 mt-1.5" />
            {i < filtered.length - 1 && <div className="w-px h-4 bg-primary/20" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase">{g.level}</span>
            <p className="text-sm text-on-surface leading-snug">{g.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TodayPage() {
  useEffect(() => { document.title = "Today — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const { data: briefing, isLoading, error } = useBriefing()
  const { data: config } = useConfig()
  const dismissed = new Set<string>()

  const saveConfig = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await fetch("/api/v1/user-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-config"] }),
  })

  const toggleHabit = useMutation({
    mutationFn: async (habitId: string) => {
      await fetch("/api/v1/habit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, date: new Date().toISOString() }),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today-briefing"] }),
  })

  const nudges: Nudge[] = useMemo(() => {
    if (!briefing) return []
    return generateNudges(briefing)
  }, [briefing])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 space-y-4">
            <div className="h-6 bg-surface-variant/50 rounded-xl w-1/3" />
            <div className="h-20 bg-surface-variant/50 rounded-2xl" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !briefing) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="w-12 h-12 text-on-surface-variant/70 mx-auto mb-4" />
        <p className="text-lg font-bold text-on-surface mb-2">Failed to load today's briefing</p>
        <p className="text-sm text-on-surface-variant/80 mb-6">Check your connection and try again</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["today-briefing"] })}
          className="px-6 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  const isMorning = briefing.mode === "morning"
  const isEvening = briefing.mode === "evening"
  const greeting = isMorning ? "Good morning" : isEvening ? "Good evening" : "Good afternoon"
  const Icon = isMorning ? Sun : isEvening ? Moon : Zap
  const today = new Date(briefing.date)
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-headline-sm font-bold text-on-surface">{greeting}, Lubirge</h1>
            <p className="text-sm text-on-surface-variant/80 mt-0.5">{dateStr}</p>
          </div>
        </div>

        {config && (
          <div className="mt-6 space-y-4 border-t border-outline-variant/20 pt-4">
            <EditableField
              label="Mission"
              value={config.mission}
              onSave={(v) => saveConfig.mutate({ key: "mission", value: v })}
            />
            <EditableField
              label="Vision"
              value={config.vision}
              onSave={(v) => saveConfig.mutate({ key: "vision", value: v })}
            />
            {config.core_values && (
              <div className="flex flex-wrap gap-2 pt-1">
                {config.core_values.split(",").map((v: string) => (
                  <span key={v} className="text-xs px-3 py-1 rounded-full bg-surface-variant/50 text-on-surface-variant font-semibold">
                    {v.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nudges */}
      {nudges.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-label-sm font-bold text-on-surface-variant/80 uppercase tracking-wider px-1">Reminders</h2>
          {nudges.map((n) => (
            <NudgeCard key={n.id} nudge={n} onDismiss={(id) => dismissed.add(id)} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habits */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-secondary" />
              <h2 className="text-label-lg font-bold text-on-surface">Today's Habits</h2>
            </div>
            <span className="text-xs font-bold text-on-surface-variant/80">
              {briefing.habits.doneCount}/{briefing.habits.totalCount}
            </span>
          </div>
          <div className="space-y-1">
            {briefing.habits.items.map((habit: any) => (
              <button
                key={habit.id}
                onClick={() => toggleHabit.mutate(habit.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                  habit.done
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : "hover:bg-surface-variant/30"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  habit.done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-outline-variant"
                }`}>
                  {habit.done && <CheckSquare className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-sm flex-1 min-w-0 truncate ${
                  habit.done ? "text-on-surface-variant/80 line-through" : "text-on-surface"
                }`}>
                  {habit.name}
                </span>
              </button>
            ))}
          </div>
          {briefing.habits.totalCount > 0 && (
            <div className="mt-4 h-2 rounded-full bg-surface-variant/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-secondary to-secondary/60 transition-all"
                style={{ width: `${(briefing.habits.doneCount / briefing.habits.totalCount) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Today's Goals + Focus */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-label-lg font-bold text-on-surface">Today's Focus</h2>
            </div>
            {briefing.goals.today.length > 0 ? (
              <ul className="space-y-2">
                {briefing.goals.today.map((g: any) => (
                  <li key={g.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-variant/30">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="text-sm text-on-surface">{g.title}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-on-surface-variant/80">
                No goals set for today.{' '}
                <Link href="/goals" className="text-primary font-bold hover:underline">Set your goals</Link>
              </p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-on-surface-variant/80">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {briefing.focus.totalMinutes} min focused
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" /> {briefing.focus.sessionsCount} sessions
              </span>
            </div>
          </div>

          {/* Goal Cascade Preview */}
          <div className="glass-card p-6">
            <GoalHierarchy goals={briefing.goals.fullCascade} />
            <Link
              href="/goals"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-4 hover:underline"
            >
              View all goals <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Next - Upcoming Payments & Projects */}
      <div className="glass-card p-6">
        <h2 className="text-label-lg font-bold text-on-surface mb-4">Upcoming</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider mb-3">
              Unpaid Payments ({briefing.upcoming.unpaidPayments.length})
            </p>
            {briefing.upcoming.unpaidPayments.length > 0 ? (
              <div className="space-y-2">
                {briefing.upcoming.unpaidPayments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-variant/30">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface truncate">{p.clientName}</p>
                      <p className="text-xs text-on-surface-variant/80">
                        Due {formatRelativeDate(new Date(p.createdAt))}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-error whitespace-nowrap ml-3">
                      {formatTSh(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant/80">All payments up to date</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider mb-3">
              Active Projects ({briefing.upcoming.activeProjects.length})
            </p>
            {briefing.upcoming.activeProjects.length > 0 ? (
              <div className="space-y-2">
                {briefing.upcoming.activeProjects.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-variant/30">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface truncate">{p.title}</p>
                      <p className="text-xs text-on-surface-variant/80">{p.clientName}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold whitespace-nowrap ml-2">
                      {p.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant/80">No active projects</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Habits", href: "/habits", icon: CheckSquare, color: "text-secondary" },
          { label: "Timer", href: "/timer", icon: Clock, color: "text-primary" },
          { label: "Journal", href: "/journal", icon: BookOpen, color: "text-tertiary" },
          { label: "Weekly Review", href: "/weekly-review", icon: TrendingUp, color: "text-emerald-600" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="glass-card p-4 flex flex-col items-center gap-2 text-center hover:scale-[1.02] transition-all"
            >
              <Icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-sm font-bold text-on-surface">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
