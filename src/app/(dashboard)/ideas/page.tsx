"use client"

import { useEffect, useState, Suspense } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Lightbulb, Plus, X, Loader2, AlertCircle, RefreshCw, Save, Target, Hash, Clock, Zap } from "lucide-react"
import clsx from "clsx"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

const STATUSES = ["idea", "talking", "building", "validated", "abandoned"] as const
const STATUS_COLORS: Record<string, string> = {
  idea: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  talking: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  building: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  validated: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  abandoned: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
}

interface Idea {
  id: string; problem: string; solution: string; targetUser: string
  validationNotes?: string | null; status: string; createdAt: string
}

const TABS = [
  { key: "ideas", label: "Ideas", icon: Lightbulb },
  { key: "problems", label: "Problems", icon: Target },
]

function IdeasTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [problem, setProblem] = useState("")
  const [solution, setSolution] = useState("")
  const [targetUser, setTargetUser] = useState("")
  const [validationNotes, setValidationNotes] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ideas"],
    queryFn: () => fetch("/api/v1/ideas").then((r) => r.json()),
  })
  const ideas: Idea[] = data?.items ?? []

  const createIdea = useMutation({
    mutationFn: (body: object) =>
      fetch("/api/v1/ideas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] })
      setShowForm(false); setProblem(""); setSolution(""); setTargetUser(""); setValidationNotes("")
      toast("success", "Idea Created", "New idea has been added")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/v1/ideas?id=${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ideas"] }); toast("success", "Status Updated") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  if (error) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load ideas</h3>
        <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-on-surface-variant/80">{ideas.length} idea{ideas.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Cancel" : "New Idea"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <input type="text" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Problem" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <input type="text" value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Solution" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <input type="text" value={targetUser} onChange={(e) => setTargetUser(e.target.value)} placeholder="Target User" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <textarea value={validationNotes} onChange={(e) => setValidationNotes(e.target.value)} placeholder="Validation Notes (optional)" rows={2} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none" />
          <div className="flex justify-end">
            <button onClick={() => createIdea.mutate({ problem, solution, targetUser, validationNotes: validationNotes || undefined })} disabled={!problem.trim() || !solution.trim() || !targetUser.trim() || createIdea.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
              {createIdea.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Idea
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-card-padding space-y-4">
              <div className="h-4 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
              <div className="h-3 w-full rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
              <div className="h-3 w-3/4 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
            </div>
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="w-7 h-7" />}
          title="No ideas yet"
          description="Start validating your first idea by clicking 'New Idea'"
          action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> New Idea</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <div key={idea.id} className="glass-card p-card-padding card-hover flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", STATUS_COLORS[idea.status] || "bg-outline-variant/30 text-on-surface-variant/80")}>
                  {idea.status}
                </span>
                <select value={idea.status} onChange={(e) => updateStatus.mutate({ id: idea.id, status: e.target.value })} className="text-xs bg-transparent border border-outline-variant/30 rounded-lg px-2 py-1 text-on-surface-variant cursor-pointer">
                  {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <h3 className="text-sm font-bold text-on-surface mb-1">{idea.problem}</h3>
              <p className="text-xs text-on-surface-variant/70 mb-2 line-clamp-2">{idea.solution}</p>
              <div className="mt-auto pt-3 border-t border-outline-variant/10">
                <p className="text-[11px] text-on-surface-variant/70">Target: <span className="font-semibold text-on-surface-variant/80">{idea.targetUser}</span></p>
                {idea.validationNotes && <p className="text-[11px] text-on-surface-variant/70 mt-1 line-clamp-2">{idea.validationNotes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProblemsTab() {
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

  if (error) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
        <p className="text-sm text-on-surface-variant mb-4">Failed to load problems</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">Retry</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">The Wedge Identification Framework</p>
            <p className="text-xs text-on-surface-variant/70 mt-1 leading-relaxed max-w-2xl">
              Your Wedge is hiding in your client work. Every recurring problem is a potential product.
              Log every client pain point here. The problem that appears in 3+ clients per month,
              that you could solve with software, that clients would pay monthly for — that is your Wedge.
              <strong className="text-on-surface"> Do not choose too early. Let the data tell you.</strong>
            </p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Cancel" : "Log Problem"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-card-padding border border-primary/20 dark:border-primary/30 animate-fadeIn">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Problem *</label>
              <input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. Small businesses can't accept online payments easily" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="More context about the problem..." className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">How many clients have this?</label>
                <input type="number" min={1} value={clientCount} onChange={(e) => setClientCount(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none">
                  <option value="">Select...</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Product Potential</label>
                <select value={potential} onChange={(e) => setPotential(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none">
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
      ) : wedgeList.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="w-7 h-7" />}
          title="No problems logged yet"
          description="Start logging recurring client problems you notice. Each one is a potential product."
          action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Log First Problem</Button>}
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
              <div key={w.id} className="glass-card p-card-padding card-hover">
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
                  {!w.isProduct && (
                    <button onClick={() => updateMutation.mutate({ id: w.id, isProduct: true })} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-colors" title="Mark as product idea">
                      <Target className="w-4 h-4" />
                    </button>
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

function IdeasContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam === "problems" ? "problems" : "ideas")

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Idea Validator</h2>
          <p className="text-xs text-on-surface-variant/80">Validate ideas and track client pain points</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-variant/50 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                isActive ? "bg-white dark:bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface-variant/80 hover:text-on-surface"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "ideas" ? <IdeasTab /> : <ProblemsTab />}
    </div>
  )
}

export default function IdeasPage() {
  useEffect(() => { document.title = "Idea Validator \u2014 LUMARY Studio" }, [])
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <IdeasContent />
    </Suspense>
  )
}
