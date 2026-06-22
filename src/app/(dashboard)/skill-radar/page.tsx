"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Radar, Loader2, AlertCircle, RefreshCw, Save, BookOpen, Target, Layers } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const CATEGORIES = ["dev", "design", "language", "business"] as const
const CATEGORY_LABELS: Record<string, string> = { dev: "Development", design: "Design", language: "Language", business: "Business" }
const CATEGORY_COLORS: Record<string, string> = {
  dev: "border-l-emerald-500",
  design: "border-l-secondary",
  language: "border-l-tertiary",
  business: "border-l-amber-500",
}
const CATEGORY_BG: Record<string, string> = {
  dev: "bg-emerald-100 text-emerald-700",
  design: "bg-blue-100 text-blue-700",
  language: "bg-purple-100 text-purple-700",
  business: "bg-amber-100 text-amber-700",
}

interface Skill {
  id: string; name: string; rating: number; category?: string; tier?: number; gap?: string; resources?: string; notes?: string
}

const TIER_META = [
  { tier: 1, label: "Critical Gap", color: "text-error", bg: "bg-error/5 border-l-error" },
  { tier: 2, label: "Needs Work", color: "text-amber-600", bg: "bg-amber-500/5 border-l-amber-500" },
  { tier: 3, label: "Building", color: "text-secondary", bg: "bg-blue-500/5 border-l-secondary" },
  { tier: 4, label: "Maintain", color: "text-emerald-600", bg: "bg-emerald-500/5 border-l-emerald-500" },
]

export default function SkillRadarPage() {
  useEffect(() => { document.title = "Skill Radar — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTier, setActiveTier] = useState<number | null>(null)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [gapInputs, setGapInputs] = useState<Record<string, string>>({})
  const [resourceInputs, setResourceInputs] = useState<Record<string, string>>({})
  const [tierInputs, setTierInputs] = useState<Record<string, number>>({})

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["skill-ratings-full"],
    queryFn: () => fetch("/api/v1/skill-ratings").then((r) => r.json()),
  })

  const existing: Skill[] = data?.items ?? data?.data ?? []

  useEffect(() => {
    if (existing.length > 0) {
      const rMap: Record<string, number> = {}
      const gMap: Record<string, string> = {}
      const resMap: Record<string, string> = {}
      const tMap: Record<string, number> = {}
      existing.forEach((s) => {
        rMap[s.name] = s.rating
        if (s.gap) gMap[s.name] = s.gap
        if (s.resources) resMap[s.name] = s.resources
        if (s.tier) tMap[s.name] = s.tier
      })
      setRatings((prev) => { const m = { ...prev }; Object.keys(rMap).forEach((k) => { if (prev[k] === undefined) m[k] = rMap[k] }); return m })
      setGapInputs(gMap)
      setResourceInputs(resMap)
      setTierInputs(tMap)
    }
  }, [existing])

  const filtered = existing.filter((s) => {
    if (activeCategory && s.category !== activeCategory) return false
    if (activeTier !== null && (s.tier ?? 4) !== activeTier) return false
    return true
  })

  const categories = [...new Set(existing.map((s) => s.category).filter(Boolean))] as string[]
  const tiers = [...new Set(existing.map((s) => s.tier ?? 4).filter((t) => t !== undefined))].sort() as number[]

  const saveRatings = useMutation({
    mutationFn: () =>
      Promise.all(
        existing.map((s) =>
          fetch("/api/v1/skill-ratings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: s.name,
              rating: ratings[s.name] ?? s.rating,
              category: s.category,
              tier: tierInputs[s.name] ?? s.tier ?? 4,
              gap: gapInputs[s.name] ?? s.gap ?? null,
              resources: resourceInputs[s.name] ?? s.resources ?? null,
            }),
          })
        )
      ),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skill-ratings-full"] }); toast("success", "All Skills Saved") },
    onError: () => toast("error", "Failed to save"),
  })

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load skills</h3><p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Radar className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Skill Radar</h2>
        </div>
        <button onClick={() => saveRatings.mutate()} disabled={saveRatings.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
          {saveRatings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setActiveCategory(null); setActiveTier(null) }} className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all", !activeCategory && activeTier === null ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant/70 hover:bg-surface-container-highest/80")}>All</button>
        {categories.map((c) => (
          <button key={c} onClick={() => { setActiveCategory(c === activeCategory ? null : c); setActiveTier(null) }} className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize", activeCategory === c ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant/70 hover:bg-surface-container-highest/80")}>{CATEGORY_LABELS[c] || c}</button>
        ))}
        {TIER_META.map((t) => (
          <button key={t.tier} onClick={() => { setActiveTier(t.tier === activeTier ? null : t.tier); setActiveCategory(null) }} className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all", activeTier === t.tier ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant/70 hover:bg-surface-container-highest/80")}>{t.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="glass-card p-card-padding space-y-3"><div className="h-4 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-6 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : existing.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><Radar className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No skills yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Go to Settings → Skill Ratings to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((skill) => {
            const tierMeta = TIER_META.find((t) => t.tier === (skill.tier ?? 4))
            return (
              <div key={skill.id} className={clsx("glass-card p-card-padding border-l-4", CATEGORY_COLORS[skill.category ?? ""] || "border-l-surface-container-highest")}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-on-surface">{skill.name}</span>
                      {skill.category && <span className={clsx("px-1.5 py-0.5 rounded text-[9px] font-bold", CATEGORY_BG[skill.category])}>{CATEGORY_LABELS[skill.category] || skill.category}</span>}
                      {tierMeta && <span className={clsx("text-[10px] font-bold", tierMeta.color)}>T{tierMeta.tier}</span>}
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-primary">{ratings[skill.name] ?? skill.rating}/10</span>
                </div>

                {/* Rating slider */}
                <input type="range" min={1} max={10} value={ratings[skill.name] ?? skill.rating} onChange={(e) => setRatings((prev) => ({ ...prev, [skill.name]: parseInt(e.target.value) }))} className="w-full accent-primary mb-3" />

                {/* Tier selector */}
                <div className="flex gap-1 mb-3">
                  {TIER_META.map((t) => (
                    <button key={t.tier} onClick={() => setTierInputs((prev) => ({ ...prev, [skill.name]: t.tier }))} className={clsx(
                      "flex-1 py-1 rounded-lg text-[9px] font-bold transition-all",
                      (tierInputs[skill.name] ?? skill.tier ?? 4) === t.tier
                        ? `${t.bg.split(" ")[0]} ${t.color}`
                        : "bg-surface-container-highest/50 text-on-surface-variant/50"
                    )}>{t.label}</button>
                  ))}
                </div>

                {/* Gap input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant/70">
                    <Target className="w-3.5 h-3.5" />
                    <input value={gapInputs[skill.name] ?? skill.gap ?? ""} onChange={(e) => setGapInputs((prev) => ({ ...prev, [skill.name]: e.target.value }))} placeholder="Gap to close..." className="flex-1 bg-transparent border-b border-outline-variant/20 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary pb-0.5" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant/70">
                    <BookOpen className="w-3.5 h-3.5" />
                    <input value={resourceInputs[skill.name] ?? skill.resources ?? ""} onChange={(e) => setResourceInputs((prev) => ({ ...prev, [skill.name]: e.target.value }))} placeholder="Learning resources..." className="flex-1 bg-transparent border-b border-outline-variant/20 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary pb-0.5" />
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
