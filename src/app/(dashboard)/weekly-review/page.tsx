"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ClipboardCheck, Loader2, AlertCircle, RefreshCw, Save, ChevronDown, ChevronUp } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

interface WeeklyReview {
  id: string; weekStart: string; wins: string; lessons: string; priorities: string
  energy: number; focus: number; habitPercent: number; createdAt: string
}

function getWeekStart(d = new Date()): string {
  const date = new Date(d); const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff); return date.toISOString().slice(0, 10)
}

export default function WeeklyReviewPage() {
  useEffect(() => { document.title = "Weekly Review — LUMARY Studio" }, [])
  const queryClient = useQueryClient(); const { toast } = useToast()
  const weekStart = getWeekStart()
  const [wins, setWins] = useState(""); const [lessons, setLessons] = useState(""); const [priorities, setPriorities] = useState("")
  const [energy, setEnergy] = useState(7); const [focus, setFocus] = useState(7); const [habitPercent, setHabitPct] = useState(80)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["weekly-reviews"], queryFn: () => fetch("/api/v1/weekly-reviews").then((r) => r.json()),
  })
  const reviews: WeeklyReview[] = data?.items ?? []

  const currentReview = reviews.find((r) => r.weekStart === weekStart)

  const saveReview = useMutation({
    mutationFn: (body: object) =>
      fetch("/api/v1/weekly-reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["weekly-reviews"] }); toast("success", "Review Saved") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const handleSave = () => {
    saveReview.mutate({ weekStart, wins, lessons, priorities, energy, focus, habitPercent })
  }

  useEffect(() => {
    if (currentReview) {
      setWins(currentReview.wins || ""); setLessons(currentReview.lessons || ""); setPriorities(currentReview.priorities || "")
      setEnergy(currentReview.energy); setFocus(currentReview.focus); setHabitPct(currentReview.habitPercent)
    }
  }, [currentReview])

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load reviews</h3><p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><ClipboardCheck className="w-5 h-5 text-primary" /></div>
        <div><h2 className="text-headline-lg font-bold text-on-surface">Weekly Review</h2><p className="text-xs text-on-surface-variant/80">Week of {weekStart}</p></div>
      </div>

      {/* Current Review Form */}
      {isLoading ? (
        <div className="glass-card p-card-padding space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="space-y-2"><div className="h-4 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : (
        <div className="glass-card p-card-padding space-y-5">
          <div>
            <label className="text-label-sm text-on-surface-variant/70 mb-1.5 block font-semibold">Wins this week</label>
            <textarea value={wins} onChange={(e) => setWins(e.target.value)} rows={3} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none" placeholder="What went well?" />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant/70 mb-1.5 block font-semibold">Lessons learned</label>
            <textarea value={lessons} onChange={(e) => setLessons(e.target.value)} rows={3} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none" placeholder="What could be improved?" />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant/70 mb-1.5 block font-semibold">Next week priorities</label>
            <textarea value={priorities} onChange={(e) => setPriorities(e.target.value)} rows={3} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none" placeholder="What needs to happen next week?" />
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Energy", value: energy, set: setEnergy, color: "bg-primary" },
              { label: "Focus", value: focus, set: setFocus, color: "bg-secondary" },
              { label: "Habits %", value: habitPercent, set: setHabitPct, color: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-semibold text-on-surface">{s.label}</span>
                  <span className="text-xs font-bold text-on-surface">{s.value}{s.label === "Habits %" ? "%" : "/10"}</span>
                </div>
                <input type="range" min={s.label === "Habits %" ? 0 : 1} max={s.label === "Habits %" ? 100 : 10} value={s.value} onChange={(e) => s.set(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saveReview.isPending} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
              {saveReview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {currentReview ? "Update Review" : "Save Review"}
            </button>
          </div>
        </div>
      )}

      {/* Past Reviews */}
      <div className="glass-card p-card-padding">
        <h3 className="text-sm font-semibold text-on-surface mb-4">Past Reviews</h3>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-16 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />))}</div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-4"><ClipboardCheck className="w-6 h-6 text-on-surface-variant/80" /></div>
            <p className="text-sm font-medium text-on-surface mb-1">No reviews yet</p><p className="text-xs text-on-surface-variant/80">Complete your first weekly review above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...reviews].sort((a, b) => b.weekStart.localeCompare(a.weekStart)).map((r) => (
              <div key={r.id} className="rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-hidden">
                <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-on-surface">Week of {r.weekStart}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">E: {r.energy}/10</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-secondary/10 text-secondary">F: {r.focus}/10</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">H: {r.habitPercent}%</span>
                    </div>
                  </div>
                  {expandedId === r.id ? <ChevronUp className="w-4 h-4 text-on-surface-variant/80" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant/80" />}
                </button>
                {expandedId === r.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-outline-variant/10 pt-3 animate-fadeIn">
                    {r.wins && <div><p className="text-[11px] font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">Wins</p><p className="text-xs text-on-surface">{r.wins}</p></div>}
                    {r.lessons && <div><p className="text-[11px] font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">Lessons</p><p className="text-xs text-on-surface">{r.lessons}</p></div>}
                    {r.priorities && <div><p className="text-[11px] font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">Priorities</p><p className="text-xs text-on-surface">{r.priorities}</p></div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
