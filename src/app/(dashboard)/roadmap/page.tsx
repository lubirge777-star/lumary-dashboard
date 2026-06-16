"use client"

import { useEffect, useState } from "react"
import { ROADMAP_PHASES, type Phase } from "@/lib/v7-data/roadmap"
import {
  Award, ChevronDown, ChevronRight, ExternalLink,
  GraduationCap, Clock, DollarSign, BookOpen,
} from "lucide-react"
import clsx from "clsx"

const TOTAL_PHASES = ROADMAP_PHASES.length
const TOTAL_TASKS = ROADMAP_PHASES.reduce((s, p) => s + p.tasks.length, 0)

function TagBadge({ tag, tc }: { tag: string; tc: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: tc + "18", color: tc }}
    >
      {tag}
    </span>
  )
}

export default function RoadmapPage() {
  useEffect(() => { document.title = "Roadmap — LUMARY Studio" }, [])

  const [activePhase, setActivePhase] = useState<number>(0)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const phase = ROADMAP_PHASES[activePhase]

  const toggleTask = (phaseId: number, taskIdx: number) => {
    const key = `${phaseId}-${taskIdx}`
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleComplete = (phaseId: number, taskIdx: number) => {
    const key = `${phaseId}-${taskIdx}`
    setCompletedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const completedCount = completedTasks.size
  const progressPct = Math.round((completedCount / TOTAL_TASKS) * 100)

  const gradMap: Record<string, string> = {
    "from-emerald-500 to-emerald-600": "from-emerald-500 to-emerald-600",
    "from-blue-500 to-blue-600": "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600": "from-purple-500 to-purple-600",
    "from-amber-500 to-amber-600": "from-amber-500 to-amber-600",
    "from-cyan-500 to-cyan-600": "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600": "from-pink-500 to-pink-600",
  }

  const dotColorMap: Record<string, string> = {
    "from-emerald-500 to-emerald-600": "bg-emerald-500",
    "from-blue-500 to-blue-600": "bg-blue-500",
    "from-purple-500 to-purple-600": "bg-purple-500",
    "from-amber-500 to-amber-600": "bg-amber-500",
    "from-cyan-500 to-cyan-600": "bg-cyan-500",
    "from-pink-500 to-pink-600": "bg-pink-500",
  }

  const lightBgMap: Record<string, string> = {
    "from-emerald-500 to-emerald-600": "bg-emerald-50 dark:bg-emerald-950/30",
    "from-blue-500 to-blue-600": "bg-blue-50 dark:bg-blue-950/30",
    "from-purple-500 to-purple-600": "bg-purple-50 dark:bg-purple-950/30",
    "from-amber-500 to-amber-600": "bg-amber-50 dark:bg-amber-950/30",
    "from-cyan-500 to-cyan-600": "bg-cyan-50 dark:bg-cyan-950/30",
    "from-pink-500 to-pink-600": "bg-pink-50 dark:bg-pink-950/30",
  }

  return (
    <div className="space-y-gutter stagger-children">
      {/* Header */}
      <div>
        <h1 className="text-headline-xl font-heading font-bold text-on-surface">Full-Stack Roadmap</h1>
        <p className="text-body-md text-on-surface-variant/80 mt-1">
          {TOTAL_TASKS} tasks across {TOTAL_PHASES} phases &mdash; from zero to AI-powered SaaS builder
        </p>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-card-padding">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-label-bold text-on-surface">Overall Progress</span>
          </div>
          <span className="text-label-bold text-primary font-mono">{completedCount}/{TOTAL_TASKS} tasks</span>
        </div>
        <div className="h-3 rounded-full bg-surface-variant/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-label-sm text-on-surface-variant/70 mt-2">{progressPct}% complete</p>
      </div>

      {/* Phase Timeline */}
      <div className="glass-card p-card-padding overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max px-2">
          {ROADMAP_PHASES.map((p, i) => {
            const isActive = i === activePhase
            const isPast = completedTasks.size > 0 && i < activePhase
            const dotColor = dotColorMap[p.color] || "bg-primary"
            return (
              <button
                key={p.id}
                onClick={() => setActivePhase(i)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="flex items-center">
                  {i > 0 && (
                    <div
                      className={clsx(
                        "w-8 md:w-16 h-0.5 transition-colors",
                        isActive || isPast ? dotColor.replace("bg-", "bg-") + "/40" : "bg-outline-variant/30"
                      )}
                    />
                  )}
                  <div
                    className={clsx(
                      "w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all shrink-0",
                      isActive
                        ? `${dotColor} border-white shadow-lg scale-125`
                        : isPast
                          ? `${dotColor} border-white/60`
                          : "bg-surface-variant border-outline-variant/50 group-hover:border-primary/40"
                    )}
                  />
                </div>
                <span
                  className={clsx(
                    "text-[10px] md:text-xs font-semibold whitespace-nowrap transition-colors",
                    isActive ? "text-on-surface" : "text-on-surface-variant/70 group-hover:text-on-surface-variant"
                  )}
                >
                  {p.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Phase Detail Card */}
      <div
        className={clsx(
          "glass-card p-card-padding relative overflow-hidden",
          lightBgMap[phase.color]
        )}
      >
        <div
          className={clsx(
            "absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b",
            gradMap[phase.color]
          )}
        />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg",
                gradMap[phase.color]
              )}
            >
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-headline-lg font-heading font-bold text-on-surface">{phase.label}</h2>
              <p className="text-body-md text-on-surface-variant/70 mt-0.5">
                Phase {phase.id + 1} of {TOTAL_PHASES}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-surface-container/60">
              <Clock className="w-4 h-4 text-on-surface-variant/80" />
              <span className="text-label-bold text-on-surface">{phase.time}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-surface-container/60">
              <DollarSign className="w-4 h-4 text-on-surface-variant/80" />
              <span className="text-label-bold text-on-surface">{phase.earn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mid-Phase Card */}
      {phase.midAfter > 0 && phase.midAfter < phase.tasks.length && (
        <div className="glass-card p-card-padding border-l-4 border-amber-400 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-label-bold text-on-surface mb-1">Mid-Phase Checkpoint</h3>
              <p className="text-body-md text-on-surface-variant/70">
                You&apos;ve completed the first {phase.midAfter} tasks in this phase. Take a moment to review what you&apos;ve learned before moving on to the advanced concepts below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="glass-card p-card-padding">
        <h3 className="text-headline-md font-heading font-bold text-on-surface mb-4">
          Tasks ({phase.tasks.length})
        </h3>
        <div className="space-y-3">
          {phase.tasks.map((task, tIdx) => {
            const key = `${phase.id}-${tIdx}`
            const isOpen = expandedTasks.has(key)
            const isDone = completedTasks.has(key)
            return (
              <div
                key={key}
                className={clsx(
                  "rounded-xl border border-outline-variant/20 overflow-hidden transition-all",
                  isDone && "opacity-60"
                )}
              >
                <button
                  onClick={() => toggleTask(phase.id, tIdx)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-black/[0.02]",
                    isOpen && "border-b border-outline-variant/10"
                  )}
                >
                  <div
                    className={clsx(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer",
                      isDone
                        ? `${dotColorMap[phase.color]} border-transparent`
                        : "border-outline-variant/50 hover:border-primary/40"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleComplete(phase.id, tIdx)
                    }}
                  >
                    {isDone && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={clsx(
                      "flex-1 text-body-md",
                      isDone ? "line-through text-on-surface-variant/70" : "text-on-surface"
                    )}
                  >
                    {task.lbl}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-on-surface-variant/70 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-on-surface-variant/70 shrink-0" />
                  )}
                </button>
                {isOpen && task.src.length > 0 && (
                  <div className="px-4 py-3 space-y-2 bg-black/[0.01] dark:bg-white/[0.02]">
                    {task.src.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all group"
                      >
                        <TagBadge tag={src.tag} tc={src.tc} />
                        <span className="flex-1 text-body-md text-on-surface-variant/80 group-hover:text-on-surface transition-colors">
                          {src.name}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant/80 group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Gate Check (between phases) */}
      {activePhase < TOTAL_PHASES - 1 && (
        <div className="glass-card p-card-padding border-l-4 border-tertiary bg-tertiary/5 dark:bg-tertiary/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-tertiary" />
            </div>
            <div>
              <h3 className="text-label-bold text-on-surface mb-1">Gate Check: Ready for {ROADMAP_PHASES[activePhase + 1].label}?</h3>
              <p className="text-body-md text-on-surface-variant/70">
                Before moving to the next phase, make sure you&apos;ve completed all tasks above and built the required project. This checkpoint ensures you have a solid foundation before advancing.
              </p>
              <button
                onClick={() => setActivePhase(activePhase + 1)}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary text-on-tertiary text-label-bold hover:bg-tertiary/90 transition-all"
              >
                Continue to {ROADMAP_PHASES[activePhase + 1].label}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {ROADMAP_PHASES.map((p) => {
          const phaseDone = phase.tasks.filter((_, tIdx) => completedTasks.has(`${p.id}-${tIdx}`)).length
          const pct = p.tasks.length > 0 ? Math.round((phaseDone / p.tasks.length) * 100) : 0
          return (
            <div
              key={p.id}
              className={clsx(
                "glass-card p-4 flex items-center gap-3 cursor-pointer transition-all hover:shadow-md",
                activePhase === p.id && "ring-2 ring-primary/20"
              )}
              onClick={() => setActivePhase(p.id)}
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                  gradMap[p.color]
                )}
              >
                <span className="text-xs font-bold text-white">{p.id + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label-bold text-on-surface truncate">{p.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-surface-variant/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(135deg, ${pct > 0 ? "var(--color-primary)" : "transparent"} ${pct}%, transparent ${pct}%)`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant/70">{phaseDone}/{p.tasks.length}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
