"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { DEFAULT_TRAJECTORY } from "@/lib/v7-data/trajectory"
import { Compass, DollarSign } from "lucide-react"

interface Milestone {
  id: string
  year: string
  label: string
  target: string | null
  income: string | null
}

async function fetchJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export default function TrajectoryPage() {
  useEffect(() => { document.title = "10-Year Trajectory — LUMARY Studio" }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ["trajectory-milestones"],
    queryFn: () => fetchJson("/api/v1/trajectory-milestones"),
    retry: 1,
  })

  const milestonesFromApi: Milestone[] = data?.items ?? []
  const milestones = milestonesFromApi.length > 0
    ? milestonesFromApi.map((m) => ({ year: m.year, label: m.label, target: m.target ?? "", income: m.income ?? "" }))
    : DEFAULT_TRAJECTORY

  if (error) {
    return (
      <div className="space-y-gutter animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface">10-Year Trajectory</h2>
            <p className="text-xs text-on-surface-variant/80">From foundations to AI-native agency</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {DEFAULT_TRAJECTORY.map((milestone, i) => (
            <MilestoneCard key={milestone.year} milestone={milestone} index={i} />
          ))}
        </div>
        <p className="text-xs text-center text-on-surface-variant/70">Could not load from database — showing defaults</p>
      </div>
    )
  }

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Compass className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">10-Year Trajectory</h2>
          <p className="text-xs text-on-surface-variant/80">From foundations to AI-native agency</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-card-padding animate-shimmer h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {milestones.map((milestone, i) => (
            <MilestoneCard key={milestone.year} milestone={milestone} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function MilestoneCard({ milestone, index }: { milestone: { year: string; label: string; target: string; income: string }; index: number }) {
  return (
    <div
      className="glass-card p-card-padding card-hover flex flex-col relative overflow-hidden"
      style={{ marginTop: index % 2 === 1 ? "24px" : "0px" }}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl"
        style={{ background: index < 2 ? "var(--color-primary)" : index < 4 ? "var(--color-secondary)" : "var(--color-tertiary)" }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary">
            {milestone.year}
          </span>
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-lg text-xs font-bold">
            <DollarSign className="w-3 h-3" />
            {milestone.income}
          </div>
        </div>
        <h3 className="text-sm font-bold text-on-surface mb-2">{milestone.label}</h3>
        <p className="text-xs text-on-surface-variant/70 leading-relaxed">{milestone.target}</p>
      </div>
    </div>
  )
}
