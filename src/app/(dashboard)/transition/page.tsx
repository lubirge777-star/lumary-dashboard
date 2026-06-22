"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TrendingUp, Loader2, AlertCircle, RefreshCw, ArrowRight, Check } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const STAGES = [
  { key: "services", label: "Services", subtitle: "Freelance design & dev", color: "border-l-primary" },
  { key: "productized", label: "Productized", subtitle: "Packaged offerings", color: "border-l-secondary" },
  { key: "wedge", label: "Wedge", subtitle: "Product problem-solving", color: "border-l-tertiary" },
  { key: "scale", label: "Scale", subtitle: "Systematized growth", color: "border-l-emerald-500" },
]

export default function TransitionPage() {
  useEffect(() => { document.title = "Product Transition — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [advanceStage, setAdvanceStage] = useState("")

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
      setAdvanceStage("")
      toast("success", "Stage Advanced!")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const currentIdx = currentStage ? STAGES.findIndex((s) => s.key === currentStage.stage) : -1

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
          {/* Roadmap */}
          <div className="glass-card p-card-padding">
            <div className="flex items-center justify-between mb-6">
              {STAGES.map((s, i) => (
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
                  {i < STAGES.length - 1 && <ArrowRight className={clsx("w-4 h-4 mx-1", i < currentIdx ? "text-primary" : "text-on-surface-variant/20")} />}
                </div>
              ))}
            </div>
          </div>

          {/* Current Stage */}
          {currentStage && (
            <div className={clsx("glass-card p-card-padding border-l-4", currentStage.stage === "services" && "border-l-primary", currentStage.stage === "productized" && "border-l-secondary", currentStage.stage === "wedge" && "border-l-tertiary", currentStage.stage === "scale" && "border-l-emerald-500")}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-on-surface-variant/70 uppercase tracking-wider font-semibold">Current Stage</p>
                  <h3 className="text-lg font-bold text-on-surface capitalize">{currentStage.stage}</h3>
                </div>
                {currentIdx < STAGES.length - 1 && (
                  <button onClick={() => advance.mutate(STAGES[currentIdx + 1].key)} disabled={advance.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
                    {advance.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Advance to {STAGES[currentIdx + 1].label}
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

          {/* History */}
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
