"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Briefcase, Plus, X, Loader2, AlertCircle, RefreshCw, Save } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const STATUSES = ["idea", "building", "shipped", "earning"] as const
const STATUS_COLORS: Record<string, string> = {
  idea: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  building: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  earning: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
}

interface Project {
  id: string; name: string; description?: string | null; status: string
  url?: string | null; techStack?: string | null; income?: number | null; createdAt: string
}

export default function PortfolioPage() {
  useEffect(() => { document.title = "Portfolio — LUMARY Studio" }, [])
  const queryClient = useQueryClient(); const { toast } = useToast()
  const [showForm, setShowForm] = useState(false); const [filter, setFilter] = useState("all")
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [url, setUrl] = useState("")
  const [techStack, setTechStack] = useState(""); const [income, setIncome] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["portfolio-projects"], queryFn: () => fetch("/api/v1/portfolio-projects").then((r) => r.json()),
  })
  const projects: Project[] = data?.items ?? []
  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter)

  const createProject = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/portfolio-projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["portfolio-projects"] }); setShowForm(false); setName(""); setDesc(""); setUrl(""); setTechStack(""); setIncome(""); toast("success", "Project Added") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => fetch(`/api/v1/portfolio-projects?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["portfolio-projects"] }); toast("success", "Status Updated") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load portfolio</h3>
        <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Briefcase className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Project Portfolio</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Project"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" rows={2} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none" />
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (optional)" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="Tech stack" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Monthly income (optional)" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <div className="flex justify-end">
            <button onClick={() => createProject.mutate({ name, description: desc || undefined, url: url || undefined, techStack: techStack || undefined, income: income ? parseInt(income) : undefined })} disabled={!name.trim() || createProject.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
              {createProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Add Project
            </button>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={clsx("px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all", filter === s ? "bg-primary text-on-primary" : "bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant")}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="glass-card p-card-padding space-y-4"><div className="h-4 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-full rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-20 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><Briefcase className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No projects yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Start building your portfolio by adding your first project</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filtered.map((p) => (
            <div key={p.id} className="glass-card p-card-padding card-hover flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", STATUS_COLORS[p.status])}>{p.status}</span>
                <select value={p.status} onChange={(e) => updateStatus.mutate({ id: p.id, status: e.target.value })} className="text-xs bg-transparent border border-outline-variant/30 rounded-lg px-2 py-1 text-on-surface-variant cursor-pointer">
                  {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <h3 className="text-sm font-bold text-on-surface">{p.name}</h3>
              {p.description && <p className="text-xs text-on-surface-variant/70 mt-1 line-clamp-2">{p.description}</p>}
              {p.techStack && <p className="text-xs text-on-surface-variant/70 mt-2 font-mono">{p.techStack}</p>}
              <div className="mt-auto pt-3 border-t border-outline-variant/10 flex items-center justify-between">
                {p.income ? <span className="text-sm font-bold text-emerald-600">${p.income}/mo</span> : <span />}
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Visit →</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
