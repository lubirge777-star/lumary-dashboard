"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import {
  Lightbulb, Plus, X, AlertCircle, Target,
  TrendingUp, Hash, Clock, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/components/ui/toast"

export default function WedgePage() {
  useEffect(() => { document.title = "Wedge — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [problem, setProblem] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState("")
  const [potential, setPotential] = useState("medium")
  const [clientCount, setClientCount] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: wedges = [], isLoading, error, refetch } = useQuery({
    queryKey: ["wedge"],
    queryFn: () => fetch("/api/v1/wedge").then((r) => r.json()),
  })

  const createMutation = useMutation({
    mutationFn: (body: any) =>
      fetch("/api/v1/wedge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wedge"] }); resetForm(); toast("success", "Problem Logged", "Wedge entry created") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: any) =>
      fetch(`/api/v1/wedge?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wedge"] }); toast("success", "Updated", "Wedge entry updated") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const resetForm = () => {
    setProblem(""); setDescription(""); setFrequency(""); setPotential("medium"); setClientCount(1); setEditingId(null); setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!problem.trim()) return
    const payload = { problem: problem.trim(), description: description.trim() || undefined, frequency: frequency || undefined, potential, clientCount }
    if (editingId) updateMutation.mutate({ id: editingId, ...payload })
    else createMutation.mutate(payload)
  }

  const wedgeList = Array.isArray(wedges) ? wedges : []

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Wedge Log</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Track recurring client problems → your next SaaS product idea</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Log Problem
        </Button>
      </div>

      <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-5 card-hover">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">The Wedge Identification Framework</p>
            <p className="text-xs text-on-surface-variant/70 mt-1 leading-relaxed">
              Your Wedge is hiding in your client work. Every recurring problem is a potential product.
              Log every client pain point here. The problem that appears in 3+ clients per month,
              that you could solve with software, that clients would pay monthly for — that is your Wedge.
              <strong className="text-on-surface"> Do not choose too early. Let the data tell you.</strong>
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-primary/20 dark:border-primary/30 p-5 animate-fadeIn">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Problem *</label>
              <input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. Small businesses can't accept online payments easily" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="More context about the problem..." className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">How many clients have this?</label>
                <input type="number" min={1} value={clientCount} onChange={(e) => setClientCount(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none">
                  <option value="">Select...</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Product Potential</label>
                <select value={potential} onChange={(e) => setPotential(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{editingId ? "Update" : "Log Problem"}</Button>
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-medium hover:bg-surface-variant/50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
            <p className="text-sm text-on-surface-variant mb-4">Failed to load wedge log</p>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">Retry</button>
          </div>
        </div>
      ) : wedgeList.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="w-7 h-7" />}
          title="No problems logged yet"
          description="Start logging recurring client problems you notice. Each one is a potential product."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              Log First Problem
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {wedgeList.map((w: any) => {
            const potentialColors: Record<string, string> = {
              high: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
              medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
              low: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
            }
            return (
              <div key={w.id} className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-5 card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-on-surface">{w.problem}</h4>
                    {w.description && <p className="text-xs text-on-surface-variant/70 mt-1">{w.description}</p>}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-on-surface-variant/80">
                        <Hash className="w-3 h-3" />
                        {w.clientCount} client{w.clientCount !== 1 ? "s" : ""}
                      </span>
                      {w.frequency && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant/80">
                          <Clock className="w-3 h-3" />
                          {w.frequency}
                        </span>
                      )}
                      {w.potential && (
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", potentialColors[w.potential] || "")}>
                          {w.potential} potential
                        </span>
                      )}
                      {w.isProduct && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <Zap className="w-3 h-3" /> Product Idea
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!w.isProduct && (
                      <button
                        onClick={() => updateMutation.mutate({ id: w.id, isProduct: true })}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                        title="Mark as product idea"
                      >
                        <Target className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
