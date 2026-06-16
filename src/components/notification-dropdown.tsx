"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Bell, Check, Loader2, AlertTriangle, Target, Clock,
  TrendingUp, Briefcase, ClipboardList, Brain, Sparkles, X,
} from "lucide-react"
import clsx from "clsx"

const SEVERITY_COLORS = {
  critical: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  medium: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  low: "bg-surface-variant/50 text-on-surface-variant",
}

const TYPE_ICONS = {
  habit: Clock,
  goal: Target,
  focus: Clock,
  payment: TrendingUp,
  project: Briefcase,
  review: ClipboardList,
  cross_domain: Brain,
}

function NudgeIcon({ type, severity }: { type: string; severity: string }) {
  const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || Bell
  return (
    <div className={clsx(
      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
      SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.low
    )}>
      <Icon className="w-4 h-4" />
    </div>
  )
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["agent-nudges"],
    queryFn: () => fetch("/api/v1/agent/nudges").then((r) => r.json()),
    refetchInterval: 60000,
  })

  const acknowledge = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/v1/agent/acknowledge?id=${id}`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-nudges"] })
    },
  })

  const acknowledgeAll = useMutation({
    mutationFn: () =>
      fetch("/api/v1/agent/acknowledge", { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-nudges"] })
    },
  })

  const runCheck = useMutation({
    mutationFn: () =>
      fetch("/api/v1/agent/check", { method: "POST" }).then(() =>
        queryClient.invalidateQueries({ queryKey: ["agent-nudges"] })
      ),
  })

  const nudges: any[] = data?.nudges ?? []
  const unread = data?.unread ?? 0

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(!open)
          if (!open) runCheck.mutate()
        }}
        className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-secondary hover:scale-105 transition-all relative"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-3 right-3 min-w-[18px] h-[18px] flex items-center justify-center bg-error text-white text-[10px] font-bold rounded-full border-2 border-white px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-80 rounded-2xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/10 shadow-2xl shadow-black/10 overflow-hidden animate-fadeInUp z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-on-surface">Agent</h3>
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={() => acknowledgeAll.mutate()}
                  className="text-[10px] text-on-surface-variant/70 hover:text-on-surface"
                  title="Acknowledge all"
                >
                  Done
                </button>
              )}
              <button
                onClick={() => runCheck.mutate()}
                className="text-[10px] text-primary hover:underline"
                title="Refresh agent"
              >
                Refresh
              </button>
              <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider bg-surface-container-high px-2 py-0.5 rounded-full">
                {unread}
              </span>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : nudges.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-on-surface-variant/70">
                <Sparkles className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">All clear — no nudges</p>
              </div>
            ) : (
              nudges.map((nudge: any) => (
                <div
                  key={nudge.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors border-b border-outline-variant/10 last:border-0 group"
                >
                  <NudgeIcon type={nudge.type} severity={nudge.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-on-surface truncate">{nudge.title}</p>
                      {nudge.severity === "critical" && (
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant/70 mt-0.5 line-clamp-2">{nudge.message}</p>
                  </div>
                  <button
                    onClick={() => acknowledge.mutate(nudge.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-outline-variant/30 transition-all shrink-0"
                    title="Acknowledge"
                  >
                    <Check className="w-3.5 h-3.5 text-on-surface-variant/80" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
