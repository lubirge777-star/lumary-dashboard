"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import clsx from "clsx"
import OperationsTab from "./operations-tab"
import {
  CalendarClock, CalendarDays, ListChecks, ClipboardCheck, TrendingUp,
  Clock, Check, Loader2, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, Sun, Moon, BookOpen, Code, Palette, Brain,
  MessageSquare, NotebookPen, PenLine, Plus, X, Save,
  Building2, Receipt, ClipboardList, Target,
  ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react"

type TabId = "daily" | "timetable" | "checklists" | "review" | "transition"

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "daily", label: "Daily Ops", icon: CalendarClock },
  { id: "timetable", label: "Timetable", icon: CalendarDays },
  { id: "checklists", label: "Checklists", icon: ListChecks },
  { id: "review", label: "Weekly Review", icon: ClipboardCheck },
  { id: "transition", label: "Transition", icon: TrendingUp },
]

function OpsPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = (searchParams.get("tab") as TabId) || "daily"

  const setTab = (t: TabId) => {
    router.replace(`/ops?tab=${t}`, { scroll: false })
  }

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-1">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                tab === t.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant/80 hover:bg-outline-variant/20"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {tab === "daily" && <OperationsTab />}
      {tab === "timetable" && <TimetableTab />}
      {tab === "checklists" && <ChecklistsTab />}
      {tab === "review" && <WeeklyReviewTab />}
      {tab === "transition" && <TransitionTab />}
    </div>
  )
}

export default function OpsPage() {
  useEffect(() => { document.title = "Operations Hub — LUMARY Studio" }, [])
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    }>
      <OpsPageInner />
    </Suspense>
  )
}

/* ========= Timetable Tab ========= */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

const CATEGORY_COLORS: Record<string, string> = {
  DEEN: "bg-amber-100 text-amber-700", PLAN: "bg-sky-100 text-sky-700",
  ARABIC: "bg-cyan-100 text-cyan-700", CLASS: "bg-blue-100 text-blue-700",
  CODING: "bg-emerald-100 text-emerald-700", FIGMA: "bg-pink-100 text-pink-700",
  EDIT: "bg-violet-100 text-violet-700", GROWTH: "bg-indigo-100 text-indigo-700",
  SOCIAL: "bg-orange-100 text-orange-700", REFLECT: "bg-rose-100 text-rose-700",
  MEAL: "bg-yellow-100 text-yellow-700", COMMUTE: "bg-gray-100 text-gray-700",
  SLEEP: "bg-slate-100 text-slate-700", DHUHR: "bg-amber-100 text-amber-700",
  ASR: "bg-amber-100 text-amber-700", MAGHRIB: "bg-amber-100 text-amber-700",
  ISHA: "bg-amber-100 text-amber-700", JUMUAH: "bg-amber-100 text-amber-700",
  JUMUAH_PREP: "bg-amber-100 text-amber-700", BODY: "bg-red-100 text-red-700",
  MIND: "bg-purple-100 text-purple-700", REST: "bg-slate-100 text-slate-700",
  MARY: "bg-pink-100 text-pink-700", PREP: "bg-sky-100 text-sky-700",
}

function TimetableTab() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [dayIndex, setDayIndex] = useState(new Date().getDay())

  const { data: slotsData, isLoading, error, refetch } = useQuery({
    queryKey: ["timetable", dayIndex],
    queryFn: () => fetch(`/api/v1/routine?dayOfWeek=${dayIndex}`).then((r) => r.json()),
  })

  const slots: any[] = slotsData?.data ?? slotsData?.items ?? []

  const completeSlot = useMutation({
    mutationFn: (slotId: string) =>
      fetch("/api/v1/routine/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, completed: true }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable", dayIndex] })
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div>
        <h2 className="text-headline-lg font-bold text-on-surface">Daily Timetable</h2>
      </div>

      <div className="glass-card p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setDayIndex((d) => (d === 0 ? 6 : d - 1))} className="p-2 rounded-xl hover:bg-surface-container-highest transition-all"><ChevronLeft className="w-5 h-5 text-on-surface" /></button>
          <div className="text-center">
            <h3 className="text-lg font-bold text-on-surface">{dayName}</h3>
            <p className="text-xs text-on-surface-variant/70">{doneCount}/{totalCount} done</p>
          </div>
          <button onClick={() => setDayIndex((d) => (d === 6 ? 0 : d + 1))} className="p-2 rounded-xl hover:bg-surface-container-highest transition-all"><ChevronRight className="w-5 h-5 text-on-surface" /></button>
        </div>
        <div className="flex gap-1 justify-center">
          {DAY_LABELS.map((l, i) => (
            <button key={l} onClick={() => setDayIndex(i)} className={clsx(
              "w-9 h-9 rounded-lg text-[10px] font-bold transition-all",
              i === dayIndex ? "bg-primary text-on-primary" : "bg-surface-container-highest/50 text-on-surface-variant/70 hover:bg-surface-container-highest"
            )}>{l}</button>
          ))}
        </div>
        <div className="mt-4 h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

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
            const category = Object.keys(CATEGORY_COLORS).find((k) => slot.label.toUpperCase().includes(k)) || ""
            return (
              <div key={slot.id ?? i} className={clsx(
                "glass-card p-card-padding flex items-center gap-4 transition-all",
                slot.completed && "opacity-60"
              )}>
                <button
                  onClick={() => { if (!slot.completed) completeSlot.mutate(slot.id) }}
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

/* ========= Checklists Tab ========= */

const CHECKLIST_CATEGORIES = [
  { key: "legal_setup", label: "Legal Setup", icon: Building2, gradient: "grad-orange" },
  { key: "business_startup", label: "Business Startup", icon: Receipt, gradient: "grad-blue" },
  { key: "weekly_admin", label: "Weekly Admin", icon: ClipboardList, gradient: "grad-purple" },
  { key: "monthly_review", label: "Monthly Review", icon: Target, gradient: "grad-green" },
]

function ChecklistsTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [activeCat, setActiveCat] = useState("legal_setup")
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["checklists", activeCat],
    queryFn: () => fetch(`/api/v1/checklists?category=${activeCat}`).then((r) => r.json()),
  })

  const items: any[] = data?.data ?? data?.items ?? []

  const completeItem = useMutation({
    mutationFn: (itemId: string) =>
      fetch("/api/v1/checklists/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", activeCat] })
      toast("success", "Completed!")
    },
  })

  const createItem = useMutation({
    mutationFn: (body: object) =>
      fetch("/api/v1/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", activeCat] })
      setShowForm(false); setNewTitle(""); setNewDesc("")
      toast("success", "Item Added")
    },
  })

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load checklists</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
    )
  }

  const activeMeta = CHECKLIST_CATEGORIES.find((c) => c.key === activeCat)
  const doneCount = items.filter((i: any) => i.done).length

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><ListChecks className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Checklists</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Item"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CHECKLIST_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <button key={cat.key} onClick={() => setActiveCat(cat.key)} className={clsx(
              "relative overflow-hidden p-4 rounded-xl border transition-all text-left",
              activeCat === cat.key
                ? "bg-white dark:bg-surface-container-high border-primary/30 shadow-sm"
                : "bg-white/40 dark:bg-surface-container/40 border-outline-variant/20 hover:border-primary/10"
            )}>
              <div className={clsx("absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 blur-2xl", cat.gradient)} />
              <div className="relative z-10">
                <div className={clsx(
                  "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                  cat.gradient === "grad-orange" && "bg-primary/10 text-primary",
                  cat.gradient === "grad-blue" && "bg-blue-100 text-blue-700",
                  cat.gradient === "grad-purple" && "bg-purple-100 text-purple-700",
                  cat.gradient === "grad-green" && "bg-emerald-100 text-emerald-700",
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-on-surface">{cat.label}</p>
              </div>
            </button>
          )
        })}
      </div>

      {activeMeta && !isLoading && items.length > 0 && (
        <div className="glass-card p-card-padding">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-on-surface">{activeMeta.label}</p>
            <p className="text-xs text-on-surface-variant/70">{doneCount}/{items.length} done</p>
          </div>
          <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.round((doneCount / items.length) * 100)}%` }} />
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Item title" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary min-h-[60px]" />
          <button onClick={() => createItem.mutate({ category: activeCat, title: newTitle, description: newDesc })} disabled={!newTitle.trim() || createItem.isPending} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
            {createItem.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Add to {activeMeta?.label}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="glass-card p-card-padding"><div className="h-4 w-48 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><ListChecks className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No items yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Run seed_business_setup_checklist via Hermes to populate, or add items manually</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className={clsx(
              "glass-card p-card-padding flex items-center gap-4 transition-all",
              item.done && "opacity-60"
            )}>
              <button
                onClick={() => { if (!item.done) completeItem.mutate(item.id) }}
                disabled={item.done || completeItem.isPending}
                className={clsx(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                  item.done ? "bg-primary border-primary" : "border-outline-variant/40 hover:border-primary/40"
                )}
              >
                {item.done && <Check className="w-3.5 h-3.5 text-on-primary" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={clsx("text-sm", item.done ? "text-on-surface-variant/60 line-through" : "text-on-surface")}>{item.title}</p>
                {item.description && <p className="text-xs text-on-surface-variant/70 mt-0.5">{item.description}</p>}
              </div>
              {item.isRequired && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-primary/10 text-primary shrink-0">Required</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ========= Weekly Review Tab ========= */

interface WeeklyReview {
  id: string; weekStart: string; wins: string; lessons: string; priorities: string
  energy: number; focus: number; habitPercent: number; createdAt: string
}

function getWeekStart(d = new Date()): string {
  const date = new Date(d); const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff); return date.toISOString().slice(0, 10)
}

function WeeklyReviewTab() {
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

/* ========= Transition Tab ========= */

const TRANSITION_STAGES = [
  { key: "services", label: "Services", subtitle: "Freelance design & dev", color: "border-l-primary" },
  { key: "productized", label: "Productized", subtitle: "Packaged offerings", color: "border-l-secondary" },
  { key: "wedge", label: "Wedge", subtitle: "Product problem-solving", color: "border-l-tertiary" },
  { key: "scale", label: "Scale", subtitle: "Systematized growth", color: "border-l-emerald-500" },
]

function TransitionTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["product-transition"],
    queryFn: () => fetch("/api/v1/transition").then((r) => r.json()),
  })

  const transition: any = data?.data ?? {}
  const currentStage: any = transition.currentStage
  const history: any[] = transition.history ?? []

  const advance = useMutation({
    mutationFn: (stage: string) =>
      fetch("/api/v1/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, notes: `Advanced to ${stage} phase` }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-transition"] })
      toast("success", "Stage Advanced!")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const currentIdx = currentStage ? TRANSITION_STAGES.findIndex((s) => s.key === currentStage.stage) : -1

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div>
        <h2 className="text-headline-lg font-bold text-on-surface">Product Transition</h2>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="glass-card p-card-padding"><div className="h-4 w-48 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><TrendingUp className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No transition stages yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Run seed_default_product_transition via Hermes to initialize</p>
        </div>
      ) : (
        <>
          <div className="glass-card p-card-padding">
            <div className="flex items-center justify-between mb-6">
              {TRANSITION_STAGES.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                    i <= currentIdx ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant/50",
                    s.key === currentStage?.stage && "ring-2 ring-primary ring-offset-2"
                  )}>{i + 1}</div>
                  <div className="hidden md:block">
                    <p className={clsx("text-sm font-semibold", i <= currentIdx ? "text-on-surface" : "text-on-surface-variant/50")}>{s.label}</p>
                    <p className="text-[10px] text-on-surface-variant/70">{s.subtitle}</p>
                  </div>
                  {i < TRANSITION_STAGES.length - 1 && <ArrowRight className={clsx("w-4 h-4 mx-1", i < currentIdx ? "text-primary" : "text-on-surface-variant/20")} />}
                </div>
              ))}
            </div>
          </div>

          {currentStage && (
            <div className={clsx("glass-card p-card-padding border-l-4", currentStage.stage === "services" && "border-l-primary", currentStage.stage === "productized" && "border-l-secondary", currentStage.stage === "wedge" && "border-l-tertiary", currentStage.stage === "scale" && "border-l-emerald-500")}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-on-surface-variant/70 uppercase tracking-wider font-semibold">Current Stage</p>
                  <h3 className="text-lg font-bold text-on-surface capitalize">{currentStage.stage}</h3>
                </div>
                {currentIdx < TRANSITION_STAGES.length - 1 && (
                  <button onClick={() => advance.mutate(TRANSITION_STAGES[currentIdx + 1].key)} disabled={advance.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
                    {advance.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Advance to {TRANSITION_STAGES[currentIdx + 1].label}
                  </button>
                )}
              </div>
              {currentStage.metrics && (
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(currentStage.metrics).map(([k, v]: any) => (
                    <div key={k} className="bg-surface-container-highest/50 rounded-xl p-3">
                      <p className="text-[10px] text-on-surface-variant/70 uppercase font-semibold mb-1">{k.replace(/([A-Z])/g, " $1").trim()}</p>
                      <p className="text-sm font-bold text-on-surface">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div className="glass-card p-card-padding">
              <h3 className="text-sm font-semibold text-on-surface mb-4">Transition History</h3>
              <div className="space-y-3">
                {history.map((h: any) => (
                  <div key={h.id} className="flex items-center gap-4">
                    <div className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      h.isCurrent ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant/70"
                    )}>
                      {h.isCurrent ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-on-surface-variant/30" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-on-surface capitalize">{h.stage}</p>
                      <p className="text-xs text-on-surface-variant/70">{new Date(h.startedAt).toLocaleDateString()} {h.notes && `— ${h.notes}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
