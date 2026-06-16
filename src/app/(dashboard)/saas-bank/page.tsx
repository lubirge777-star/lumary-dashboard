"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Package, Plus, X, Loader2, AlertCircle, RefreshCw, Save } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const STATUSES = ["idea", "validating", "building", "live", "abandoned"] as const
const STATUS_COLORS: Record<string, string> = {
  idea: "bg-purple-100 text-purple-700", validating: "bg-blue-100 text-blue-700",
  building: "bg-amber-100 text-amber-700", live: "bg-emerald-100 text-emerald-700",
  abandoned: "bg-rose-100 text-rose-700",
}

interface SaasIdea {
  id: string; name: string; description?: string | null; market?: string | null
  techStack?: string | null; status: string; createdAt: string
}

export default function SaasBankPage() {
  useEffect(() => { document.title = "Micro-SaaS Ideas — LUMARY Studio" }, [])
  const queryClient = useQueryClient(); const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [market, setMarket] = useState(""); const [techStack, setTechStack] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["saas-ideas"], queryFn: () => fetch("/api/v1/saas-ideas").then((r) => r.json()),
  })
  const ideas: SaasIdea[] = data?.items ?? []

  const createIdea = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/saas-ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["saas-ideas"] }); setShowForm(false); setName(""); setDesc(""); setMarket(""); setTechStack(""); toast("success", "Idea Added") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => fetch(`/api/v1/saas-ideas?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["saas-ideas"] }); toast("success", "Status Updated") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load ideas</h3>
        <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Micro-SaaS Idea Bank</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Idea"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Idea name" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" rows={2} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={market} onChange={(e) => setMarket(e.target.value)} placeholder="Target market" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="Tech stack" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div className="flex justify-end">
            <button onClick={() => createIdea.mutate({ name, description: desc || undefined, market: market || undefined, techStack: techStack || undefined })} disabled={!name.trim() || createIdea.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
              {createIdea.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Add Idea
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="glass-card p-card-padding space-y-3"><div className="h-4 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-full rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-20 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><Package className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No ideas yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Start building your SaaS idea bank</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {ideas.map((idea) => (
            <div key={idea.id} className="glass-card p-card-padding card-hover flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", STATUS_COLORS[idea.status])}>{idea.status}</span>
                <select value={idea.status} onChange={(e) => updateStatus.mutate({ id: idea.id, status: e.target.value })} className="text-xs bg-transparent border border-outline-variant/30 rounded-lg px-2 py-1 text-on-surface-variant cursor-pointer">
                  {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <h3 className="text-sm font-bold text-on-surface">{idea.name}</h3>
              {idea.description && <p className="text-xs text-on-surface-variant/70 mt-1 line-clamp-2">{idea.description}</p>}
              <div className="mt-auto pt-3 border-t border-outline-variant/10 flex flex-wrap gap-2">
                {idea.market && <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-variant/50 text-on-surface-variant/70">{idea.market}</span>}
                {idea.techStack && <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/5 text-primary font-mono">{idea.techStack}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
