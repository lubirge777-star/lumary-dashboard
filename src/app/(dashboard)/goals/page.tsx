"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Target, ChevronRight, Plus, X, Loader2, AlertCircle, RefreshCw,
  Edit3, Trash2, Save,
} from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const LEVELS = [
  { key: "dream", label: "Dream", icon: "🌟" },
  { key: "year10", label: "10-Year Vision", icon: "🔭" },
  { key: "year", label: "This Year", icon: "📅" },
  { key: "quarter", label: "This Quarter", icon: "📊" },
  { key: "month", label: "This Month", icon: "📆" },
  { key: "week", label: "This Week", icon: "📋" },
  { key: "today", label: "Today", icon: "🎯" },
] as const

type LevelKey = typeof LEVELS[number]["key"]

const DEFAULT_GOALS: Record<LevelKey, { title: string; description?: string }[]> = {
  dream: [
    { title: "Build LUMARY into a leading East African AI-native agency", description: "A full-stack agency that combines design, AI, and strategy to serve global clients from Tanzania." },
  ],
  year10: [
    { title: "50+ team, 3 products", description: "Scale to 50+ team members across design, engineering, and AI. Ship 3 proprietary SaaS products." },
  ],
  year: [
    { title: "Full-stack freelancer with 20+ clients", description: "Operate as a top-tier full-stack freelancer serving 20+ active clients across web, brand, and AI." },
  ],
  quarter: [
    { title: "Ship 2 major projects, onboard 5 retainers", description: "Deliver 2 flagship projects and convert at least 5 clients to monthly retainers." },
  ],
  month: [
    { title: "Build systems & automate operations", description: "Set up CRM automations, create SOPs, and streamline client onboarding." },
  ],
  week: [
    { title: "Close 2 leads, deliver 1 milestone", description: "Follow up with 2 hot leads and deliver one major project milestone by Friday." },
  ],
  today: [
    { title: "Deep work block: 4 hours on priority project", description: "No meetings, no distractions. Just ship code and design." },
  ],
}

interface Goal {
  id: string
  level: string
  title: string
  description?: string | null
  sortOrder: number
  createdAt: string
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export default function GoalsPage() {
  useEffect(() => { document.title = "Goals — LUMARY Studio" }, [])

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [addingLevel, setAddingLevel] = useState<LevelKey | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["goals"],
    queryFn: () => fetchJson("/api/v1/goals"),
  })

  const allGoals: Goal[] = data?.items ?? []

  const createGoal = useMutation({
    mutationFn: (data: { level: string; title: string; description?: string }) =>
      fetchJson("/api/v1/goals", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      setAddingLevel(null)
      setNewTitle("")
      setNewDescription("")
      toast("success", "Goal Added", "New goal has been created")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const updateGoal = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string } }) =>
      fetchJson(`/api/v1/goals?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      setEditingId(null)
      toast("success", "Goal Updated", "The goal has been updated")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const deleteGoal = useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/goals?id=${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      toast("success", "Goal Deleted", "The goal has been removed")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const seedDefaults = useMutation({
    mutationFn: () =>
      fetchJson("/api/v1/goals/seed", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      toast("success", "Defaults Loaded", "Default goal cascade has been created")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const getGoalsForLevel = (level: LevelKey) =>
    allGoals.filter((g) => g.level === level).sort((a, b) => a.sortOrder - b.sortOrder)

  const hasAnyGoals = allGoals.length > 0

  const startEditing = (goal: Goal) => {
    setEditingId(goal.id)
    setEditTitle(goal.title)
    setEditDescription(goal.description ?? "")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle("")
    setEditDescription("")
  }

  const saveEdit = (id: string) => {
    const payload: { title?: string; description?: string } = {}
    if (editTitle.trim()) payload.title = editTitle.trim()
    payload.description = editDescription.trim() || undefined
    updateGoal.mutate({ id, data: payload })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load goals</h3>
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

  return (
    <div className="space-y-gutter animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-headline-lg font-bold text-on-surface">Goal Cascade</h2>
        </div>
        {!hasAnyGoals && !isLoading && (
          <button
            onClick={() => seedDefaults.mutate()}
            disabled={seedDefaults.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"
          >
            {seedDefaults.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Load Defaults
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-28 rounded-2xl bg-surface-container-low" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {LEVELS.map((level, idx) => {
            const goals = getGoalsForLevel(level.key)
            const isAdding = addingLevel === level.key

            return (
              <div key={level.key} className="relative">
                {/* Connector line */}
                {idx < LEVELS.length - 1 && (
                  <div className="absolute left-8 top-16 bottom-0 w-px bg-outline-variant/30 z-0" />
                )}

                <div className="glass-card p-card-padding relative z-10 card-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-xl shrink-0">
                      {level.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-headline-md font-bold text-on-surface">{level.label}</h3>
                    </div>
                    <button
                      onClick={() => {
                        setAddingLevel(isAdding ? null : level.key)
                        setNewTitle("")
                        setNewDescription("")
                      }}
                      className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-variant/50 text-on-surface-variant flex items-center justify-center transition-all"
                    >
                      {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Add form */}
                  {isAdding && (
                    <div className="mb-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 animate-fadeIn space-y-3">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Goal title"
                        className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Description (optional)"
                        rows={2}
                        className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setAddingLevel(null)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-variant/50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => createGoal.mutate({ level: level.key, title: newTitle, description: newDescription || undefined })}
                          disabled={!newTitle.trim() || createGoal.isPending}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {createGoal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Goals list */}
                  {goals.length === 0 && !isAdding ? (
                    <p className="text-sm text-on-surface-variant/70 text-center py-4">
                      No goals yet. Click + to add one.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {goals.map((goal) => {
                        const isEditing = editingId === goal.id
                        return (
                          <div
                            key={goal.id}
                            className="rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-hidden"
                          >
                            {isEditing ? (
                              <div className="p-4 space-y-3">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                                <textarea
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  rows={2}
                                  className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={cancelEditing}
                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-variant/50 transition-all"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => saveEdit(goal.id)}
                                    disabled={!editTitle.trim() || updateGoal.isPending}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40"
                                  >
                                    {updateGoal.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="px-4 py-3 flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-on-surface">{goal.title}</p>
                                  {goal.description && (
                                    <p className="text-xs text-on-surface-variant/70 mt-1 leading-relaxed">{goal.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => startEditing(goal)}
                                    className="p-1.5 rounded-lg hover:bg-surface-variant/50 text-on-surface-variant/70 hover:text-primary transition-all"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Delete this goal?")) deleteGoal.mutate(goal.id)
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant/70 hover:text-error transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
