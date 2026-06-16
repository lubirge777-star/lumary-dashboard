"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Radar, Loader2, AlertCircle, RefreshCw, Save } from "lucide-react"
import { useToast } from "@/components/ui/toast"

const SKILLS = ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Figma", "Arabic", "UI Design", "Git", "Docker", "Python"]

interface SkillRating {
  id: string; name: string; rating: number
}

export default function SkillRadarPage() {
  useEffect(() => { document.title = "Skill Radar — LUMARY Studio" }, [])
  const queryClient = useQueryClient(); const { toast } = useToast()
  const [ratings, setRatings] = useState<Record<string, number>>({})

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["skill-ratings"], queryFn: () => fetch("/api/v1/skill-ratings").then((r) => r.json()),
  })
  const existing: SkillRating[] = data?.items ?? []

  useEffect(() => {
    if (existing.length > 0) {
      const map: Record<string, number> = {}
      existing.forEach((s) => { map[s.name] = s.rating })
      setRatings((prev) => {
        const merged = { ...prev }
        Object.keys(map).forEach((k) => { if (prev[k] === undefined) merged[k] = map[k] })
        return merged
      })
    }
  }, [existing])

  const saveRatings = useMutation({
    mutationFn: () =>
      Promise.all(
        SKILLS.filter((s) => ratings[s] !== undefined).map((skill) =>
          fetch("/api/v1/skill-ratings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: skill, rating: ratings[skill] }),
          })
        )
      ),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skill-ratings"] }); toast("success", "Ratings Saved") },
    onError: () => toast("error", "Failed to save ratings"),
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
          {saveRatings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Ratings
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 14 }).map((_, i) => (<div key={i} className="glass-card p-card-padding space-y-3"><div className="h-4 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-6 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKILLS.map((skill) => (
            <div key={skill} className="glass-card p-card-padding">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-on-surface">{skill}</span>
                <span className="text-xs font-bold font-mono text-primary">{ratings[skill] ?? 5}/10</span>
              </div>
              <input
                type="range"
                min={1} max={10}
                value={ratings[skill] ?? 5}
                onChange={(e) => setRatings((prev) => ({ ...prev, [skill]: parseInt(e.target.value) }))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant/70 mt-1">
                <span>1</span><span>10</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
