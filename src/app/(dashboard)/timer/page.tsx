"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle, Clock, Play, Pause, RotateCcw, Target, Loader2, TimerIcon,
} from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

type TimerMode = "focus" | "short" | "long"

const MODE_CONFIG: Record<TimerMode, { label: string; duration: number; description: string }> = {
  focus: { label: "Focus Mode", duration: 25, description: "Deep work session" },
  short: { label: "Short Break", duration: 5, description: "Quick recharge" },
  long: { label: "Long Break", duration: 15, description: "Extended rest" },
}

const PHASES = ["Phase 1-6", "Figma", "Arabic", "Content", "Client Work"]

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export default function TimerPage() {
  useEffect(() => { document.title = "Timer — LUMARY Studio" }, [])

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [mode, setMode] = useState<TimerMode>("focus")
  const [seconds, setSeconds] = useState(MODE_CONFIG.focus.duration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [taskLabel, setTaskLabel] = useState("")
  const [phase, setPhase] = useState(PHASES[0])
  const [completedCount, setCompletedCount] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: sessionsData, isLoading, error, refetch } = useQuery({
    queryKey: ["timer-sessions"],
    queryFn: () => fetchJson("/api/v1/timer-sessions"),
  })

  useEffect(() => {
    if (sessionsData?.items) {
      const today = new Date().toDateString()
      const todaySessions = sessionsData.items.filter(
        (s: any) => new Date(s.createdAt).toDateString() === today && s.completed
      )
      setCompletedCount(todaySessions.length)
    }
  }, [sessionsData])

  const totalFocusToday = sessionsData?.items
    ?.filter((s: any) => {
      const isToday = new Date(s.createdAt).toDateString() === new Date().toDateString()
      return isToday && s.mode === "focus" && s.completed
    })
    ?.reduce((sum: number, s: any) => sum + s.duration, 0) ?? 0

  const createSession = useMutation({
    mutationFn: (data: { mode: string; duration: number; taskLabel?: string; phase?: string }) =>
      fetchJson("/api/v1/timer-sessions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timer-sessions"] })
      toast("success", "Session Saved", "Timer session has been recorded")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode)
    setSeconds(MODE_CONFIG[newMode].duration * 60)
    setIsRunning(false)
  }, [])

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsRunning(false)
    } else {
      setIsRunning(true)
    }
  }, [isRunning])

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
    setSeconds(MODE_CONFIG[mode].duration * 60)
  }, [mode])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsRunning(false)

          createSession.mutate({
            mode,
            duration: MODE_CONFIG[mode].duration,
            taskLabel: taskLabel || undefined,
            phase: phase !== PHASES[0] ? phase : undefined,
          })

          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, mode, taskLabel, phase, createSession])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  const progress = 1 - seconds / (MODE_CONFIG[mode].duration * 60)
  const circumference = 2 * Math.PI * 140
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Timer Card */}
        <div className="glass-card p-card-padding lg:col-span-2 flex flex-col items-center">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-2xl mb-8">
            {(Object.entries(MODE_CONFIG) as [TimerMode, typeof MODE_CONFIG[TimerMode]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  mode === key
                    ? "bg-primary text-on-primary shadow-lg"
                    : "text-on-surface-variant hover:bg-surface-variant/50"
                )}
              >
                {cfg.label.split(" ")[0]} {cfg.duration}
              </button>
            ))}
          </div>

          {/* Timer Circle */}
          <div className="relative mb-6">
            <svg width="320" height="320" className="transform -rotate-90">
              <circle cx="160" cy="160" r="140" fill="none" stroke="var(--color-surface-variant)" strokeWidth="8" />
              <circle
                cx="160" cy="160" r="140"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <TimerIcon className="w-8 h-8 text-primary/40 mb-2" />
              <span className="text-6xl font-bold text-on-surface font-mono tracking-tight">{display}</span>
              <span className="text-sm font-semibold text-on-surface-variant/70 mt-2">{MODE_CONFIG[mode].description}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={toggleTimer}
              className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
                isRunning
                  ? "bg-error/10 text-error hover:bg-error/20"
                  : "bg-primary text-on-primary hover:bg-primary-fixed-dim"
              )}
            >
              {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant flex items-center justify-center transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Task Label */}
          <div className="w-full max-w-md">
            <label className="text-label-sm text-on-surface-variant/70 mb-1.5 block">What are you working on?</label>
            <input
              type="text"
              value={taskLabel}
              onChange={(e) => setTaskLabel(e.target.value)}
              placeholder="e.g. Design homepage hero section"
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-gutter">
          {/* Phase Selector */}
          <div className="glass-card p-card-padding">
            <label className="text-label-sm text-on-surface-variant/70 mb-2 block font-semibold uppercase tracking-wider">Phase</label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="glass-card p-card-padding space-y-5">
            <h3 className="text-headline-md font-bold text-on-surface">Today&apos;s Stats</h3>
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="animate-shimmer h-16 rounded-2xl bg-surface-container-low" />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
                  <p className="text-sm text-on-surface-variant/80 mb-3">Failed to load stats</p>
                  <button onClick={() => refetch()} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold">Retry</button>
                </div>
              </div>
            ) : !sessionsData?.items?.length ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <Target className="w-8 h-8 text-on-surface-variant/80 mx-auto mb-2" />
                  <p className="text-sm text-on-surface-variant/80">No sessions yet</p>
                  <p className="text-xs text-on-surface-variant/70 mt-1">Complete a timer session to see your stats</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant/80">Sessions</p>
                      <p className="text-sm font-bold text-on-surface">{completedCount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant/80">Focus Time</p>
                      <p className="text-sm font-bold text-on-surface">{totalFocusToday} min</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-tertiary" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant/80">Velocity</p>
                      <p className="text-sm font-bold text-on-surface">
                        {totalFocusToday > 0 ? `${(totalFocusToday / (completedCount || 1)).toFixed(1)} min/session` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Why Pomodoro */}
          <div className="glass-card p-card-padding relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 grad-orange rounded-full opacity-10 blur-2xl" />
            <div className="relative z-10">
              <h3 className="text-headline-md font-bold text-on-surface mb-3">Why Pomodoro Works</h3>
              <ul className="space-y-2 text-sm text-on-surface-variant/80">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>25-minute sprints defeat procrastination</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                  <span>Regular breaks prevent burnout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2 shrink-0" />
                  <span>Tracked sessions build momentum</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
