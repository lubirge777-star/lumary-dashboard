"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Circle, Plus, X, Loader2, AlertCircle, RefreshCw, Save } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

interface Commitment {
  id: string; title: string; description?: string | null; dueDate?: string | null; completed: boolean; createdAt: string
}

export default function AccountabilityPage() {
  useEffect(() => { document.title = "Accountability — LUMARY Studio" }, [])
  const queryClient = useQueryClient(); const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [dueDate, setDueDate] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["commitments"], queryFn: () => fetch("/api/v1/commitments").then((r) => r.json()),
  })
  const commitments: Commitment[] = data?.items ?? []
  const sorted = [...commitments].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    return 0
  })

  const createCommitment = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/commitments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["commitments"] }); setShowForm(false); setTitle(""); setDesc(""); setDueDate(""); toast("success", "Commitment Added") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
  const toggleCompleted = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => fetch(`/api/v1/commitments?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["commitments"] }); toast("success", "Updated") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const doneCount = commitments.filter((c) => c.completed).length

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load commitments</h3>
        <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-primary" /></div>
          <div><h2 className="text-headline-lg font-bold text-on-surface">Accountability</h2><p className="text-xs text-on-surface-variant/80">{doneCount}/{commitments.length} completed</p></div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Commitment title" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <div className="flex justify-end">
            <button onClick={() => createCommitment.mutate({ title, description: desc || undefined, dueDate: dueDate || undefined })} disabled={!title.trim() || createCommitment.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
              {createCommitment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Add
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="glass-card p-card-padding flex items-center gap-4"><div className="w-6 h-6 rounded-full bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="flex-1 space-y-2"><div className="h-4 w-3/4 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-1/4 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div></div>))}
        </div>
      ) : commitments.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><CheckCircle2 className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No commitments yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Add your first commitment to start tracking</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((c) => {
            const isOverdue = c.dueDate && !c.completed && new Date(c.dueDate) < new Date()
            return (
              <div key={c.id} className={clsx("glass-card p-card-padding flex items-start gap-4 card-hover", c.completed && "opacity-60")}>
                <button onClick={() => toggleCompleted.mutate({ id: c.id, completed: !c.completed })} className="mt-0.5 shrink-0">
                  {c.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-on-surface-variant/70 hover:text-primary transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={clsx("text-sm font-semibold", c.completed ? "text-on-surface-variant/70 line-through" : "text-on-surface")}>{c.title}</p>
                  {c.description && <p className="text-xs text-on-surface-variant/70 mt-1">{c.description}</p>}
                  {c.dueDate && (
                    <p className={clsx("text-[11px] mt-1 font-medium", isOverdue ? "text-rose-600" : "text-on-surface-variant/70")}>
                      {isOverdue ? "Overdue: " : "Due: "}{new Date(c.dueDate).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
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
