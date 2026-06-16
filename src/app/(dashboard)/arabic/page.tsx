"use client"

import { useEffect, useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Trophy, BookOpen, Play, Globe, Target, Loader2, Plus, Clock,
  CheckCircle, AlertCircle, RefreshCw, Mic, ChevronRight,
} from "lucide-react"
import clsx from "clsx"
import { ARABIC_STAGES } from "@/lib/v7-data/roadmap"

interface Session {
  id: string
  type: string
  duration: number
  createdAt: string
  notes?: string
}

const sessionTypes = [
  { key: "duolingo", label: "Duolingo", color: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" },
  { key: "quran", label: "Quran Study", color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" },
  { key: "video", label: "Video Lesson", color: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200" },
  { key: "speaking", label: "Speaking", color: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200" },
]

const timelineSteps = [
  { key: "script", label: "Read Arabic Script", color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
  { key: "makharij", label: "Pronounce — Makharij", color: "amber", gradient: "from-amber-500 to-amber-600" },
  { key: "understand50", label: "Understand 50% of Quran", color: "blue", gradient: "from-blue-500 to-blue-600" },
  { key: "grammar", label: "Quranic Grammar", color: "purple", gradient: "from-purple-500 to-purple-600" },
  { key: "speak65", label: "Speak at 65%+", color: "pink", gradient: "from-pink-500 to-pink-600" },
  { key: "understand85", label: "Understand 85% of Quran", color: "amber", gradient: "from-amber-500 to-amber-600" },
  { key: "fluency", label: "Fluency", color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
]

const stepDescriptions: Record<string, { desc: string; status: string; resources: { name: string; url: string }[] }> = {
  script: {
    desc: "Master the Arabic alphabet — 28 letters, forms, vowel marks (harakat). Goal: Read any Arabic text aloud without hesitation.",
    status: "DONE",
    resources: [
      { name: "Duolingo Arabic", url: "https://www.duolingo.com/course/ar/en/Learn-Arabic" },
      { name: "Arabic 101 — Read Anything", url: "https://www.youtube.com/playlist?list=PL6TlMIZ5ylgpLYKU_z1YxdAAw7wrTWvcQ" },
    ],
  },
  makharij: {
    desc: "Correct pronunciation (makharij) of every letter. Learn tajweed rules for proper Quran recitation.",
    status: "IN PROGRESS",
    resources: [
      { name: "Makharij & Sifaat (30 lessons)", url: "https://www.youtube.com/playlist?list=PL6TlMIZ5ylgqoNf7LW6hHEdPVIMWCnMFm" },
    ],
  },
  understand50: {
    desc: "Learn the most frequent Quranic vocabulary. 70% of the Quran uses only ~500 words. Focus on高频 words.",
    status: "NEXT UP",
    resources: [
      { name: "Arabic 101 Academy", url: "https://academy.arabic101.org/courses/understand-the-holy-quran" },
    ],
  },
  grammar: {
    desc: "Sarf (morphology) and Nahw (syntax) — how words are built from roots and how sentences are structured.",
    status: "LOCKED",
    resources: [
      { name: "Verb Roots MADE EASY", url: "https://www.youtube.com/watch?v=QzGG66l6frQ" },
    ],
  },
  speak65: {
    desc: "Start speaking Arabic in daily situations. Mistakes are proof you are trying. Focus on survival phrases.",
    status: "LOCKED",
    resources: [
      { name: "Maha Arabic Beginner Lessons", url: "https://www.youtube.com/playlist?list=PL0A4EB5D68AF2E67E" },
      { name: "ArabicPod101", url: "https://www.arabicpod101.com" },
    ],
  },
  understand85: {
    desc: "Deep vocabulary expansion. Study tafsir alongside recitation. Read Quran daily with understanding.",
    status: "LOCKED",
    resources: [
      { name: "Quranology (76 lessons)", url: "https://www.youtube.com/@Arabic101/playlists" },
    ],
  },
  fluency: {
    desc: "Full fluency in reading, writing, speaking, and understanding Arabic. Teach others what you have learned.",
    status: "LOCKED",
    resources: [
      { name: "ArabicPod101 YouTube", url: "https://www.youtube.com/@ArabicPod101" },
    ],
  },
}

const dayNames = ["Fajr", "Asr", "Isha"] as const
const routineChecklists: Record<string, { time: string; items: string[] }> = {
  Fajr: {
    time: "15 min",
    items: [
      "Duolingo Arabic (10xp min)",
      "Review 5 vocab cards",
      "Read 1 page of Arabic text aloud",
    ],
  },
  Asr: {
    time: "15 min",
    items: [
      "Quran study — 1 new word list",
      "Watch 1 video lesson",
      "Write 3 sentences in Arabic",
    ],
  },
  Isha: {
    time: "10 min",
    items: [
      "Speaking practice (timer)",
      "Log today sessions",
      "Plan tomorrow goals",
    ],
  },
}

const speakingPrompts = [
  "What is your name and where are you from?",
  "Describe your family in 3 sentences.",
  "What did you eat today?",
  "What is your daily routine?",
  "Describe your house or apartment.",
  "What do you like to do in your free time?",
  "Describe the weather today.",
  "What did you learn today in Arabic?",
  "Count from 1 to 20 in Arabic.",
  "Name 5 colors and 5 animals in Arabic.",
  "What time is it right now?",
  "Describe your job or studies.",
  "What are you wearing today?",
  "Talk about your favorite food.",
  "Where do you want to travel and why?",
  "Describe a friend or colleague.",
  "What did you do yesterday?",
  "What will you do tomorrow?",
  "Name the days of the week in Arabic.",
  "Describe what you see around you right now.",
]

const statusBadge = (status: string) => {
  switch (status) {
    case "DONE":
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" /> DONE</span>
    case "IN PROGRESS":
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700"><Clock className="w-3 h-3" /> IN PROGRESS</span>
    case "NEXT UP":
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700"><Target className="w-3 h-3" /> NEXT UP</span>
    case "LOCKED":
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-outline-variant/30 text-on-surface-variant/80"><AlertCircle className="w-3 h-3" /> LOCKED</span>
    default:
      return null
  }
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export default function ArabicPage() {
  useEffect(() => { document.title = "Arabic — LUMARY Studio" }, [])

  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [routineProgress, setRoutineProgress] = useState<Record<string, boolean[]>>({
    Fajr: [false, false, false],
    Asr: [false, false, false],
    Isha: [false, false, false],
  })

  const [timerSeconds, setTimerSeconds] = useState(900)
  const [isRunning, setIsRunning] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [speakingStreak, setSpeakingStreak] = useState(0)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [logType, setLogType] = useState("duolingo")
  const [logDuration, setLogDuration] = useState(15)
  const [logNotes, setLogNotes] = useState("")
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError, refetch } = useQuery({
    queryKey: ["arabic-sessions"],
    queryFn: () => fetch("/api/v1/arabic-sessions").then((r) => r.json()),
  })

  const logMutation = useMutation({
    mutationFn: (body: { type: string; duration: number; notes?: string }) =>
      fetch("/api/v1/arabic-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arabic-sessions"] })
      setShowSessionForm(false)
      setLogNotes("")
      setLogDuration(15)
    },
  })

  useEffect(() => {
    if (sessionsData) {
      const items = Array.isArray(sessionsData) ? sessionsData : (sessionsData as any).items ?? (sessionsData as any).sessions ?? []
      setSessions(items)
    }
  }, [sessionsData])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  const startTimer = () => {
    if (timerSeconds === 0) setTimerSeconds(900)
    setIsRunning(true)
  }

  const pauseTimer = () => setIsRunning(false)

  const resetTimer = () => {
    setIsRunning(false)
    setTimerSeconds(900)
  }

  const nextPrompt = () => {
    setCurrentPrompt((prev) => (prev + 1) % speakingPrompts.length)
    setSpeakingStreak((prev) => prev + 1)
  }

  const toggleRoutineItem = (day: string, index: number) => {
    setRoutineProgress((prev) => {
      const updated = { ...prev, [day]: [...prev[day]] }
      updated[day][index] = !updated[day][index]
      return updated
    })
  }

  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.createdAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  const streak = 12
  const dailyTarget = 45
  const dailyTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0)
  const dailyProgress = Math.min(100, Math.round((dailyTotal / dailyTarget) * 100))

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-on-surface">Arabic Learning Command Center</h1>
        <p className="text-sm text-on-surface-variant/80 mt-1">
          Track your journey to read, understand, and speak Arabic — from the alphabet to Quranic fluency
        </p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-card-padding flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">Streak</p>
            <p className="text-xl font-bold font-heading text-on-surface">{streak} days</p>
          </div>
        </div>

        <div className="glass-card p-card-padding flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">Today</p>
            <p className="text-xl font-bold font-heading text-on-surface">{todaySessions.length} session{todaySessions.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="glass-card p-card-padding flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">Duolingo</p>
            <p className="text-xl font-bold font-heading text-on-surface">Section 2</p>
            <p className="text-[10px] text-on-surface-variant/70">Unit 3 — Phrases</p>
          </div>
        </div>

        <div className="glass-card p-card-padding flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">Daily Target</p>
              <p className="text-xs font-mono font-semibold text-primary">{dailyTotal}/{dailyTarget} min</p>
            </div>
            <div className="h-2.5 rounded-full bg-outline-variant/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Step Arabic Timeline */}
        <div className="lg:col-span-7 glass-card p-card-padding">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-primary" />
            Your Arabic Journey — 7 Milestones
          </h3>
          <div className="relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-outline-variant/30" />
            <div className="space-y-3">
              {timelineSteps.map((step, i) => {
                const info = stepDescriptions[step.key]
                const isActive = activeStep === step.key
                const statusColors: Record<string, string> = {
                  DONE: "bg-emerald-500",
                  "IN PROGRESS": "bg-amber-500",
                  "NEXT UP": "bg-blue-500",
                  LOCKED: "bg-outline-variant",
                }
                const dotColor = statusColors[info.status] || "bg-outline-variant"
                return (
                  <div key={step.key} className="relative">
                    <button
                      onClick={() => setActiveStep(isActive ? null : step.key)}
                      className="w-full text-left flex items-start gap-4 p-4 rounded-xl hover:bg-surface-container-low/50 transition-all group"
                    >
                      <div className={clsx(
                        "w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-all ring-2 ring-white",
                        dotColor
                      )}>
                        <span className="text-[10px] font-bold text-white">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={clsx(
                            "text-sm font-semibold transition-colors",
                            info.status === "LOCKED" ? "text-on-surface-variant/70" : "text-on-surface"
                          )}>
                            {step.label}
                          </span>
                          {statusBadge(info.status)}
                        </div>
                        {isActive && (
                          <div className="mt-3 animate-fadeInUp">
                            <p className="text-sm text-on-surface-variant/80 leading-relaxed">{info.desc}</p>
                            {info.resources.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {info.resources.map((r, ri) => (
                                  <a
                                    key={ri}
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/5 text-primary hover:bg-primary/10 transition-all"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    {r.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className={clsx(
                        "w-4 h-4 text-on-surface-variant/80 mt-1.5 shrink-0 transition-transform",
                        isActive && "rotate-90"
                      )} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Session Logging */}
          <div className="glass-card p-card-padding">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" />
                Log Session
              </h3>
              <button
                onClick={() => setShowSessionForm(!showSessionForm)}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Log
              </button>
            </div>

            {showSessionForm && (
              <div className="mb-4 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 animate-fadeIn">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant block mb-1">Type</label>
                    <select
                      value={logType}
                      onChange={(e) => setLogType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-white text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                    >
                      {sessionTypes.map((st) => (
                        <option key={st.key} value={st.key}>{st.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant block mb-1">Duration (min)</label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={logDuration}
                      onChange={(e) => setLogDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-white text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant block mb-1">Notes (optional)</label>
                    <input
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="What did you study?"
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-white text-on-surface text-sm placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => logMutation.mutate({ type: logType, duration: logDuration, notes: logNotes || undefined })}
                      disabled={logMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-50"
                    >
                      {logMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Save
                    </button>
                    <button
                      onClick={() => setShowSessionForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant/80 hover:text-on-surface transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {sessionTypes.map((st) => (
                <button
                  key={st.key}
                  onClick={() => {
                    setLogType(st.key)
                    setShowSessionForm(true)
                  }}
                  className={clsx(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all",
                    st.color
                  )}
                >
                  <Plus className="w-3 h-3" />
                  {st.label}
                </button>
              ))}
            </div>

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : sessionsError ? (
              <div className="flex flex-col items-center gap-2 py-4 text-xs text-error">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Failed to load sessions
                </div>
                <button onClick={() => refetch()} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed-dim transition-all">Retry</button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant/70">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">No sessions logged yet</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                {sessions.slice(0, 20).map((s) => {
                  const st = sessionTypes.find((t) => t.key === s.type)
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low/50 transition-all">
                      <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                        st?.color?.split(" ")[0] || "bg-surface-variant"
                      )}>
                        <span className="text-[10px] font-bold">{st?.label?.charAt(0) || "?"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-on-surface">{st?.label || s.type}</span>
                          <span className="text-[10px] font-mono text-primary font-semibold">{s.duration}m</span>
                        </div>
                        {s.notes && (
                          <p className="text-[10px] text-on-surface-variant/80 truncate">{s.notes}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-on-surface-variant/70 shrink-0">
                        {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Daily Routine Cards */}
          <div className="glass-card p-card-padding">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              Daily Arabic Routine
            </h3>
            <div className="space-y-3">
              {dayNames.map((day) => {
                const routine = routineChecklists[day]
                const progress = routineProgress[day]
                const done = progress.filter(Boolean).length
                const total = progress.length
                return (
                  <div key={day} className="rounded-xl border border-outline-variant/20 bg-surface-container-low/30 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-surface-container-low/80 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold",
                          done === total ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {done}/{total}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">After {day}</p>
                          <p className="text-[10px] text-on-surface-variant/80">{routine.time}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-3 space-y-1.5">
                      {routine.items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleRoutineItem(day, idx)}
                          className={clsx(
                            "w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all",
                            progress[idx]
                              ? "bg-emerald-50 text-emerald-700 line-through"
                              : "text-on-surface-variant/80 hover:bg-surface-container-low/50"
                          )}
                        >
                          <div className={clsx(
                            "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                            progress[idx] ? "bg-emerald-500 border-emerald-500" : "border-outline-variant"
                          )}>
                            {progress[idx] && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Speaking Practice Timer */}
        <div className="lg:col-span-5 glass-card p-card-padding">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2 mb-4">
            <Mic className="w-4 h-4 text-primary" />
            Speaking Practice — 15 Min Timer
          </h3>
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <span className={clsx(
                "text-3xl font-bold font-mono text-white transition-all",
                isRunning && "animate-pulse"
              )}>
                {formatTime(timerSeconds)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 mb-5">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  {timerSeconds === 0 ? "Restart" : "Start"}
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-100 text-amber-700 text-sm font-semibold hover:bg-amber-200 transition-all"
                >
                  <Clock className="w-4 h-4" />
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-semibold hover:bg-surface-variant/50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/50 mb-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Try saying:</p>
              <p className="text-sm text-amber-900 leading-relaxed font-medium">
                &ldquo;{speakingPrompts[currentPrompt]}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={nextPrompt}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                Next Prompt
              </button>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant/80">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Streak: {speakingStreak} prompt{speakingStreak !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Right Stack */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quran Connection */}
          <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-200/50 p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-on-surface mb-1">Quran Connection</h3>
                <p className="text-sm text-on-surface-variant/80 leading-relaxed">
                  &ldquo;Indeed, We have sent it down as an Arabic Qur&rsquo;an so that you may understand.&rdquo;
                </p>
                <p className="text-xs text-emerald-600 font-semibold mt-2">Surah Yusuf 12:2</p>
                <p className="text-xs text-on-surface-variant/80 mt-2 leading-relaxed">
                  Every Arabic word you learn brings you closer to understanding the Quran directly.
                  The 500 most common words cover ~70% of the Quran. This is not just language learning —
                  it is a spiritual journey.
                </p>
              </div>
            </div>
          </div>

          {/* Stage-by-Stage Path */}
          <div className="glass-card p-card-padding">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-primary" />
              Stage-by-Stage Path
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARABIC_STAGES.map((stage, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-outline-variant/20 bg-white/40 p-4 hover:shadow-md hover:border-primary/20 transition-all group"
                >
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 bg-gradient-to-br shadow-sm",
                    stage.color
                  )}>
                    {stage.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-on-surface mb-1">{stage.t}</h4>
                  <p className="text-xs text-on-surface-variant/70 leading-relaxed">{stage.d}</p>
                  {stage.r.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {stage.r.slice(0, 2).map((r, ri) => (
                        <a
                          key={ri}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-primary/5 text-primary hover:bg-primary/10 transition-all"
                        >
                          {r.tag}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
