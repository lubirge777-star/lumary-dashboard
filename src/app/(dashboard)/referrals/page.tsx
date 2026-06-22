"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Users, Plus, X, Loader2, AlertCircle, RefreshCw, Save, ArrowUpRight, Check, UserPlus } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const STATUS_FLOW = ["asked", "connected", "converted", "closed"] as const
const STATUS_COLORS: Record<string, string> = {
  asked: "bg-amber-100 text-amber-700",
  connected: "bg-blue-100 text-blue-700",
  converted: "bg-emerald-100 text-emerald-700",
  closed: "bg-surface-container-highest text-on-surface-variant",
}

export default function ReferralsPage() {
  useEffect(() => { document.title = "Referrals — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [clientId, setClientId] = useState("")
  const [referredName, setReferredName] = useState("")
  const [referredPhone, setReferredPhone] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["referrals"],
    queryFn: () => fetch("/api/v1/referrals").then((r) => r.json()),
  })

  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: () => fetch("/api/v1/clients").then((r) => r.json()),
  })

  const referrals: any[] = data?.data ?? data?.items ?? []
  const clients: any[] = clientsData?.items ?? clientsData?.data ?? []

  const createReferral = useMutation({
    mutationFn: (body: object) =>
      fetch("/api/v1/referrals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] })
      setShowForm(false); setClientId(""); setReferredName(""); setReferredPhone("")
      toast("success", "Referral Logged")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const advanceStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/v1/referrals`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ referralId: id, status }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["referrals"] }); toast("success", "Status Updated") },
  })

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load referrals</h3>
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
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><UserPlus className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Referral Tracking</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Referral"}
        </button>
      </div>

      {/* Stats */}
      {!isLoading && referrals.length > 0 && (
        <div className="grid grid-cols-4 gap-gutter">
          {STATUS_FLOW.map((s) => (
            <div key={s} className="glass-card p-card-padding text-center">
              <p className={clsx("text-xl font-bold capitalize", s === "converted" ? "text-emerald-600" : s === "closed" ? "text-on-surface-variant" : "text-primary")}>{referrals.filter((r: any) => r.status === s).length}</p>
              <p className="text-[10px] text-on-surface-variant/70 capitalize mt-1">{s}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary">
            <option value="">Select referring client...</option>
            {clients.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input value={referredName} onChange={(e) => setReferredName(e.target.value)} placeholder="Referred person's name" className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
            <input value={referredPhone} onChange={(e) => setReferredPhone(e.target.value)} placeholder="Phone (optional)" className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
          </div>
          <button onClick={() => createReferral.mutate({ clientId, referredName, referredPhone })} disabled={!clientId || !referredName || createReferral.isPending} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
            {createReferral.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Log Referral
          </button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="glass-card p-card-padding"><div className="h-4 w-48 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : referrals.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><UserPlus className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No referrals yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Track who referred whom to grow your network</p>
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.map((r: any) => {
            const currentIdx = STATUS_FLOW.indexOf(r.status as any)
            return (
              <div key={r.id} className="glass-card p-card-padding">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-on-surface">{r.referredName || "Unknown"}</h4>
                      {r.referredPhone && <span className="text-xs text-on-surface-variant/60">{r.referredPhone}</span>}
                    </div>
                    {r.client?.name && <p className="text-xs text-on-surface-variant/70 mt-0.5">Referred by <strong>{r.client.name}</strong></p>}
                  </div>
                  <select
                    value={r.status}
                    onChange={(e) => advanceStatus.mutate({ id: r.id, status: e.target.value })}
                    className={clsx("px-2.5 py-1 rounded-lg text-xs font-bold border-none cursor-pointer", STATUS_COLORS[r.status] || "bg-surface-container-highest")}
                  >
                    {STATUS_FLOW.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                {/* Progress dots */}
                <div className="flex items-center gap-1">
                  {STATUS_FLOW.map((s, i) => (
                    <div key={s} className="flex items-center gap-1 flex-1">
                      <div className={clsx(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                        i <= currentIdx ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant/50"
                      )}>
                        {i < currentIdx ? <Check className="w-3 h-3" /> : i === currentIdx ? <ArrowUpRight className="w-3 h-3" /> : i + 1}
                      </div>
                      {i < STATUS_FLOW.length - 1 && <div className={clsx("flex-1 h-0.5", i < currentIdx ? "bg-primary" : "bg-surface-container-highest")} />}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
