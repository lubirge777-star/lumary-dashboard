"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ListChecks, Check, Loader2, AlertCircle, RefreshCw, Plus, X, Save, Building2, Receipt, ClipboardList, Target } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const CATEGORIES = [
  { key: "legal_setup", label: "Legal Setup", icon: Building2, gradient: "grad-orange" },
  { key: "business_startup", label: "Business Startup", icon: Receipt, gradient: "grad-blue" },
  { key: "weekly_admin", label: "Weekly Admin", icon: ClipboardList, gradient: "grad-purple" },
  { key: "monthly_review", label: "Monthly Review", icon: Target, gradient: "grad-green" },
]

export default function ChecklistsPage() {
  useEffect(() => { document.title = "Checklists — LUMARY Studio" }, [])
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

  const activeMeta = CATEGORIES.find((c) => c.key === activeCat)
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

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
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

      {/* Progress */}
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

      {/* Add Form */}
      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Item title" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary min-h-[60px]" />
          <button onClick={() => createItem.mutate({ category: activeCat, title: newTitle, description: newDesc })} disabled={!newTitle.trim() || createItem.isPending} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
            {createItem.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Add to {activeMeta?.label}
          </button>
        </div>
      )}

      {/* Items */}
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
