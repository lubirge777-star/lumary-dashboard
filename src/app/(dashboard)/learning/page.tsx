"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  BookOpen, Code, PenTool, Globe, Palette, Layers, LayoutDashboard,
  Image, Brain, MessageSquare, FileEdit, BarChart3, Trophy, Zap,
  Plus, Loader2, CheckCircle, Clock, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const tracks = [
  { category: "Coding", name: "HTML (Task 2)", status: "Current phase", impact: "Month 4" },
  { category: "Coding", name: "Phase 2", status: "Not started", impact: "Month 6-7" },
  { category: "Coding", name: "Phase 3", status: "Not started", impact: "Month 10" },
  { category: "Figma", name: "Figma Advanced", status: "4.5 hrs remaining", impact: "Immediately" },
  { category: "Figma", name: "Figma Tokens", status: "Not started", impact: "Month 3-4" },
  { category: "English", name: "English fluency", status: "Daily shadowing", impact: "Month 3-6" },
  { category: "Content", name: "Content creation", status: "Pre-production", impact: "Month 12-18" },
  { category: "Design", name: "Visual design eye", status: "Day 1 habit", impact: "Month 1-2" },
  { category: "AI", name: "AI tools practice", status: "Daily 10 min", impact: "Immediately" },
  { category: "Business", name: "Wedge Problem Logging", status: "Daily", impact: "Immediate" },
]

const categoryIcons: Record<string, React.ReactNode> = {
  Coding: <Code className="w-4 h-4" />,
  Figma: <PenTool className="w-4 h-4" />,
  English: <Globe className="w-4 h-4" />,
  Content: <FileEdit className="w-4 h-4" />,
  Design: <Palette className="w-4 h-4" />,
  AI: <Brain className="w-4 h-4" />,
  Business: <BarChart3 className="w-4 h-4" />,
}

const statusColor: Record<string, string> = {
  "Current phase": "bg-primary/10 text-primary",
  "Not started": "bg-outline-variant/30 text-on-surface-variant/80",
  "4.5 hrs remaining": "bg-amber-50 text-amber-600",
  "Daily shadowing": "bg-emerald-50 text-emerald-600",
  "Pre-production": "bg-blue-50 text-blue-600",
  "Day 1 habit": "bg-purple-50 text-purple-600",
  "Daily 10 min": "bg-emerald-50 text-emerald-600",
  Daily: "bg-emerald-50 text-emerald-600",
}

const skills = [
  { name: "Figma Tool Use", value: 60 },
  { name: "Visual Design Eye", value: 30 },
  { name: "Typography", value: 30 },
  { name: "Colour Theory", value: 35 },
  { name: "Layout & Composition", value: 35 },
  { name: "Logo Design", value: 20 },
  { name: "Thumbnail Design", value: 50 },
  { name: "ChatGPT/Claude", value: 75 },
  { name: "Ideogram AI", value: 25 },
  { name: "Leonardo AI", value: 25 },
  { name: "Written English", value: 75 },
  { name: "Spoken English fluency", value: 50 },
  { name: "Client communication", value: 30 },
  { name: "Pricing & quoting", value: 30 },
]

const trackNames = ["Coding", "Figma", "English", "Content", "Design", "AI Tools", "Business"]

export default function LearningPage() {
  useEffect(() => { document.title = "Learning — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [newTrack, setNewTrack] = useState("Coding")
  const [newTask, setNewTask] = useState("")

  const { data: progressData, error: progressError, isLoading: progressLoading, refetch: refetchProgress } = useQuery({
    queryKey: ["learning"],
    queryFn: () => fetch("/api/v1/learning").then((r) => r.json()),
  })

  const { data: streakData, error: streakError, isLoading: streakLoading, refetch: refetchStreak } = useQuery({
    queryKey: ["learning", "coding-streak"],
    queryFn: () => fetch("/api/v1/learning?track=coding").then((r) => r.json()),
  })

  const addMutation = useMutation({
    mutationFn: (body: { track: string; task: string }) =>
      fetch("/api/v1/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning"] })
      queryClient.invalidateQueries({ queryKey: ["learning", "coding-streak"] })
      setNewTask("")
      setIsAdding(false)
    },
  })

  const streak = streakData?.streak ?? 0

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-on-surface">Learning Progress</h1>
        <p className="text-sm text-on-surface-variant/80 mt-1">
          Track your coding roadmap, Figma stages, English fluency, and all learning tracks
        </p>
      </div>

      <div className="glass-card p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Learning Tracks
          </h3>
        </div>
        {progressLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="animate-shimmer h-12 rounded-2xl bg-surface-container-low" />
            ))}
          </div>
        ) : progressError ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant/80 mb-3">Failed to load tracks</p>
              <button onClick={() => refetchProgress()} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold">Retry</button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4">Category</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4">Track</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4">Status</th>
                  <th className="text-right text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3">Impact</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((t, i) => (
                  <tr key={i} className="border-b border-outline-variant/10 hover:bg-black/[0.02] transition-all">
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-1.5 text-on-surface-variant/70">
                        {categoryIcons[t.category]}
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-on-surface">{t.name}</td>
                    <td className="py-3 pr-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold",
                        statusColor[t.status] || "bg-outline-variant/30 text-on-surface-variant/80"
                      )}>
                        {t.status === "Current phase" && <Zap className="w-3 h-3" />}
                        {t.status === "Not started" && <Clock className="w-3 h-3" />}
                        {t.status === "Daily shadowing" && <CheckCircle className="w-3 h-3" />}
                        {t.status === "Daily" && <CheckCircle className="w-3 h-3" />}
                        {t.status === "Daily 10 min" && <CheckCircle className="w-3 h-3" />}
                        {t.status === "Day 1 habit" && <Trophy className="w-3 h-3" />}
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-on-surface-variant/70 font-mono text-xs">{t.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card p-card-padding">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Skill Progress
          </h3>
        </div>
        {progressLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className="animate-shimmer h-20 rounded-2xl bg-surface-container-low" />
            ))}
          </div>
        ) : progressError ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant/80 mb-3">Failed to load skills</p>
              <button onClick={() => refetchProgress()} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold">Retry</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {skills.map((skill) => (
              <div key={skill.name} className="p-3.5 rounded-xl bg-white/40 dark:bg-surface-container/40 border border-outline-variant/20 hover:border-primary/10 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-on-surface">{skill.name}</span>
                  <span className="text-xs font-semibold font-mono text-primary">{skill.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-outline-variant/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                    style={{ width: `${skill.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/30 dark:to-surface-container-high border border-amber-200/50 dark:border-amber-700/30 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-on-surface mb-1">The One Rule</h3>
            <p className="text-sm text-on-surface-variant/70 leading-relaxed">
              The sacred <strong className="text-amber-600">8 AM coding block</strong> is non-negotiable.
              Every morning, before client work, before content, before anything else — code.
              This is the foundation everything else builds on.{" "}
              <span className="text-amber-600 font-semibold">Protect this block with your life.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-card-padding">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2 mb-5">
            <Trophy className="w-4 h-4 text-primary" />
            Weekly Coding Streak
          </h3>
          {streakLoading ? (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant/80">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading streak...
            </div>
          ) : streakError ? (
            <div className="flex items-center justify-center min-h-[100px]">
              <div className="text-center">
                <AlertCircle className="w-6 h-6 text-error mx-auto mb-2" />
                <p className="text-xs text-on-surface-variant/80 mb-2">Failed to load streak</p>
                <button onClick={() => refetchStreak()} className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold">Retry</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-2xl font-bold font-mono text-on-primary">{streak}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {streak === 0 ? "Start your streak today" : `${streak} day${streak === 1 ? "" : "s"} streak`}
                </p>
                <p className="text-xs text-on-surface-variant/80 mt-0.5">
                  {streak === 0
                    ? "Complete your first coding session to begin"
                    : streak >= 7
                      ? "Amazing consistency! Keep it going."
                      : "Stay consistent to build the habit."}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card p-card-padding">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2 mb-5">
            <Plus className="w-4 h-4 text-primary" />
            Log Progress
          </h3>
          {isAdding ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!newTask.trim()) return
                addMutation.mutate({ track: newTrack, task: newTask.trim() })
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium text-on-surface-variant block mb-1.5">Track</label>
                <select
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
                >
                  {trackNames.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant block mb-1.5">Task completed</label>
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="e.g. Finished HTML forms"
                  className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!newTask.trim() || addMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {addMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Log
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setNewTask("") }}
                  className="px-4 py-2.5 text-sm text-on-surface-variant/80 hover:text-on-surface transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-outline-variant/40 text-on-surface-variant text-sm font-medium hover:border-primary/40 hover:text-primary transition-all"
            >
              <Plus className="w-4 h-4" />
              Log completed task
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
