"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Clock, Check, Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Sun, Moon, BookOpen, Code, Palette, Brain, MessageSquare, NotebookPen, PenLine, Plus } from "lucide-react"
import clsx from "clsx"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  DEEN: Moon,
  PLAN: Sun,
  ARABIC: BookOpen,
  CLASS: Code,
  CODING: Code,
  FIGMA: Palette,
  EDIT: PenLine,
  GROWTH: Brain,
  SOCIAL: MessageSquare,
  REFLECT: NotebookPen,
  MEAL: Clock,
  COMMUTE: Clock,
  SLEEP: Moon,
}

const CATEGORY_COLORS: Record<string, string> = {
  DEEN: "bg-amber-100 text-amber-700",
  PLAN: "bg-sky-100 text-sky-700",
  ARABIC: "bg-cyan-100 text-cyan-700",
  CLASS: "bg-blue-100 text-blue-700",
  CODING: "bg-emerald-100 text-emerald-700",
  FIGMA: "bg-pink-100 text-pink-700",
  EDIT: "bg-violet-100 text-violet-700",
  GROWTH: "bg-indigo-100 text-indigo-700",
  SOCIAL: "bg-orange-100 text-orange-700",
  REFLECT: "bg-rose-100 text-rose-700",
  MEAL: "bg-yellow-100 text-yellow-700",
  COMMUTE: "bg-gray-100 text-gray-700",
  SLEEP: "bg-slate-100 text-slate-700",
  DHUHR: "bg-amber-100 text-amber-700",
  ASR: "bg-amber-100 text-amber-700",
  MAGHRIB: "bg-amber-100 text-amber-700",
  ISHA: "bg-amber-100 text-amber-700",
  JUMUAH: "bg-amber-100 text-amber-700",
  JUMUAH_PREP: "bg-amber-100 text-amber-700",
  BODY: "bg-red-100 text-red-700",
  MIND: "bg-purple-100 text-purple-700",
  REST: "bg-slate-100 text-slate-700",
  MARY: "bg-pink-100 text-pink-700",
  PREP: "bg-sky-100 text-sky-700",
}

export default function TimetablePage() {
  useEffect(() => { document.title = "Timetable — LUMARY Studio" }, [])
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [dayIndex, setDayIndex] = useState(new Date().getDay())

  const { data: slotsData, isLoading, error, refetch } = useQuery({
    queryKey: ["timetable", dayIndex],
    queryFn: () => fetch(`/api/v1/routine?dayOfWeek=${dayIndex}`).then((r) => r.json()),
  })

  const slots: any[] = slotsData?.data ?? slotsData?.items ?? []

  const { data: dayStatus } = useQuery({
    queryKey: ["timetable-status", dayIndex],
    queryFn: () => fetch(`/api/v1/routine/status?dayOfWeek=${dayIndex}`).then((r) => r.json()),
  })

  const completeSlot = useMutation({
    mutationFn: (slotId: string) =>
      fetch("/api/v1/routine/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, completed: true }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable", dayIndex] })
      queryClient.invalidateQueries({ queryKey: ["timetable-status"] })
      toast("success", "Marked done!")
    },
  })

  const dayName = DAY_NAMES[dayIndex]
  const doneCount = slots.filter((s: any) => s.completed).length
  const totalCount = slots.length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load timetable</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Daily Timetable</h2>
        </div>
      </div>

      {/* Day Picker */}
      <div className="glass-card p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setDayIndex((d) => (d === 0 ? 6 : d - 1))} className="p-2 rounded-xl hover:bg-surface-container-highest transition-all"><ChevronLeft className="w-5 h-5 text-on-surface" /></button>
          <div className="text-center">
            <h3 className="text-lg font-bold text-on-surface">{dayName}</h3>
            <p className="text-xs text-on-surface-variant/70">{doneCount}/{totalCount} done</p>
          </div>
          <button onClick={() => setDayIndex((d) => (d === 6 ? 0 : d + 1))} className="p-2 rounded-xl hover:bg-surface-container-highest transition-all"><ChevronRight className="w-5 h-5 text-on-surface" /></button>
        </div>
        {/* Day dots */}
        <div className="flex gap-1 justify-center">
          {DAY_LABELS.map((l, i) => (
            <button key={l} onClick={() => setDayIndex(i)} className={clsx(
              "w-9 h-9 rounded-lg text-[10px] font-bold transition-all",
              i === dayIndex ? "bg-primary text-on-primary" : "bg-surface-container-highest/50 text-on-surface-variant/70 hover:bg-surface-container-highest"
            )}>{l}</button>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Slot List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-card-padding">
              <div className="h-4 w-48 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
            </div>
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><Clock className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No timetable for {dayName}</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Run seed_full_timetable via Hermes to populate the full weekly schedule</p>
        </div>
      ) : (
        <div className="space-y-2">
          {slots.map((slot: any, i: number) => {
            const badge = slot.label.match(/—\s*(.+)/)?.[1] || ""
            const category = Object.keys(CATEGORY_COLORS).find((k) => slot.label.toUpperCase().includes(k)) || ""
            return (
              <div key={slot.id ?? i} className={clsx(
                "glass-card p-card-padding flex items-center gap-4 transition-all",
                slot.completed && "opacity-60"
              )}>
                <button
                  onClick={() => {
                    if (!slot.completed) completeSlot.mutate(slot.id)
                  }}
                  disabled={slot.completed || completeSlot.isPending}
                  className={clsx(
                    "w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                    slot.completed ? "bg-primary border-primary" : "border-outline-variant/40 hover:border-primary/40"
                  )}
                >
                  {slot.completed && <Check className="w-4 h-4 text-on-primary" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{slot.time}</span>
                    <span className="text-xs text-on-surface-variant/60">{slot.duration}min</span>
                  </div>
                  <p className={clsx("text-sm mt-0.5", slot.completed ? "text-on-surface-variant/60 line-through" : "text-on-surface")}>{slot.label}</p>
                </div>
                {category && (
                  <span className={clsx("px-2 py-1 rounded-lg text-[10px] font-bold shrink-0", CATEGORY_COLORS[category])}>{category}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
