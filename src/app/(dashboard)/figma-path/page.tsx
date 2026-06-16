"use client"

import { useEffect, useState } from "react"
import { FIGMA_STAGES } from "@/lib/v7-data/roadmap"
import {
  Palette, ExternalLink, CheckCircle, Clock, Target,
  ArrowRight,
} from "lucide-react"
import clsx from "clsx"

function StatusBadge({ status, colorClass }: { status: string; colorClass: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    "DONE ✅": <CheckCircle className="w-3.5 h-3.5" />,
    "In progress": <Clock className="w-3.5 h-3.5" />,
    "Ship it": <Target className="w-3.5 h-3.5" />,
  }

  const cleanStatus = status.replace(" ✅", "")

  const colorMap: Record<string, string> = {
    "text-emerald-600": "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    "text-blue-600": "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    "text-amber-600": "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    "text-amber-500": "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    "text-cyan-600": "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
    "text-purple-600": "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    "text-pink-600": "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400",
    "text-pink-500": "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400",
  }

  const icon = iconMap[status] || iconMap[cleanStatus] || null

  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold",
      colorMap[colorClass] || "bg-surface-variant text-on-surface-variant"
    )}>
      {icon}
      {cleanStatus}
    </span>
  )
}

function TagBadge({ tag, color }: { tag: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: color + "18", color }}
    >
      {tag}
    </span>
  )
}

const dotColors: Record<number, string> = {
  0: "bg-emerald-500",
  1: "bg-blue-500",
  2: "bg-amber-500",
  3: "bg-cyan-500",
  4: "bg-purple-500",
  5: "bg-pink-500",
  6: "bg-amber-500",
  7: "bg-pink-500",
}

export default function FigmaPathPage() {
  useEffect(() => { document.title = "Figma Path — LUMARY Studio" }, [])

  const [activeStage, setActiveStage] = useState(0)
  const stage = FIGMA_STAGES[activeStage]

  const completedCount = FIGMA_STAGES.filter((s) => s.s.startsWith("DONE")).length
  const progressPct = Math.round((completedCount / FIGMA_STAGES.length) * 100)

  return (
    <div className="space-y-gutter stagger-children">
      {/* Header */}
      <div>
        <h1 className="text-headline-xl font-heading font-bold text-on-surface">Figma Learning Path</h1>
        <p className="text-body-md text-on-surface-variant/80 mt-1">
          {FIGMA_STAGES.length} stages &mdash; from essentials to publishing the LUMARY design system
        </p>
      </div>

      {/* Progress */}
      <div className="glass-card p-card-padding">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-label-bold text-on-surface">Journey Progress</span>
          </div>
          <span className="text-label-bold text-primary font-mono">{completedCount}/{FIGMA_STAGES.length} stages</span>
        </div>
        <div className="h-3 rounded-full bg-surface-variant/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-tertiary to-tertiary/60 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-label-sm text-on-surface-variant/70 mt-2">{progressPct}% complete</p>
      </div>

      {/* Stage Timeline */}
      <div className="glass-card p-card-padding overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max px-2">
          {FIGMA_STAGES.map((s, i) => {
            const isActive = i === activeStage
            const isDone = s.s.startsWith("DONE")
            const dotColor = dotColors[i] || "bg-primary"
            return (
              <button
                key={i}
                onClick={() => setActiveStage(i)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="flex items-center">
                  {i > 0 && (
                    <div
                      className={clsx(
                        "w-8 md:w-16 h-0.5 transition-colors",
                        isActive || isDone ? "bg-tertiary/30" : "bg-outline-variant/30"
                      )}
                    />
                  )}
                  <div
                    className={clsx(
                      "w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all shrink-0",
                      isActive
                        ? `${dotColor} border-white shadow-lg scale-125`
                        : isDone
                          ? `${dotColor} border-white/60`
                          : "bg-surface-variant border-outline-variant/50 group-hover:border-tertiary/40"
                    )}
                  />
                </div>
                <span
                  className={clsx(
                    "text-[10px] md:text-xs font-semibold whitespace-nowrap transition-colors",
                    isActive ? "text-on-surface" : "text-on-surface-variant/70 group-hover:text-on-surface-variant"
                  )}
                >
                  {s.t}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stage Detail */}
      <div className="glass-card p-card-padding relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-tertiary/5 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tertiary to-tertiary/60 flex items-center justify-center shrink-0 shadow-lg">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-headline-lg font-heading font-bold text-on-surface">{stage.t}</h2>
              <p className="text-body-md text-on-surface-variant/70 mt-0.5">
                Stage {activeStage + 1} of {FIGMA_STAGES.length}
              </p>
            </div>
          </div>
          <StatusBadge status={stage.s} colorClass={stage.c} />
        </div>
        <p className="text-body-lg text-on-surface-variant/80 leading-relaxed mb-6">
          {stage.d}
        </p>

        {/* Resource Grid */}
        {stage.r.length > 0 && (
          <div>
            <h3 className="text-label-bold text-on-surface uppercase tracking-wider mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Resources ({stage.r.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stage.r.map((res, rIdx) => (
                <a
                  key={rIdx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/50 dark:bg-surface-container/50 border border-outline-variant/20 hover:border-tertiary/30 hover:shadow-md transition-all group"
                >
                  <TagBadge tag={res.tag} color={res.tc} />
                  <span className="flex-1 text-body-md text-on-surface-variant/80 group-hover:text-on-surface transition-colors min-w-0">
                    {res.name}
                  </span>
                  <ExternalLink className="w-4 h-4 text-on-surface-variant/80 group-hover:text-tertiary transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Stage Prompt */}
      {activeStage < FIGMA_STAGES.length - 1 && (
        <div className="glass-card p-card-padding border-l-4 border-tertiary">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center shrink-0">
              <ArrowRight className="w-5 h-5 text-tertiary" />
            </div>
            <div className="flex-1">
              <h3 className="text-label-bold text-on-surface mb-1">Up Next: {FIGMA_STAGES[activeStage + 1].t}</h3>
              <p className="text-body-md text-on-surface-variant/70">
                {FIGMA_STAGES[activeStage + 1].d}
              </p>
              <button
                onClick={() => setActiveStage(activeStage + 1)}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary text-on-tertiary text-label-bold hover:bg-tertiary/90 transition-all"
              >
                Start {FIGMA_STAGES[activeStage + 1].t}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Stages Summary */}
      <div className="glass-card p-card-padding">
        <h3 className="text-headline-md font-heading font-bold text-on-surface mb-4">All Stages</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FIGMA_STAGES.map((s, i) => {
            const isActive = i === activeStage
            const isDone = s.s.startsWith("DONE")
            return (
              <button
                key={i}
                onClick={() => setActiveStage(i)}
                className={clsx(
                  "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                  isActive
                    ? "border-tertiary/30 bg-tertiary/5 shadow-sm"
                    : "border-outline-variant/20 bg-white/40 dark:bg-surface-container/40 hover:border-tertiary/20 hover:shadow-sm"
                )}
              >
                <div
                  className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-white",
                    dotColors[i] || "bg-primary"
                  )}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label-bold text-on-surface truncate">{s.t}</p>
                  <p className="text-[10px] text-on-surface-variant/70 mt-0.5 truncate">{s.s.replace(" ✅", "")}</p>
                </div>
                {isDone && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
