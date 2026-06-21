"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, Clock, AlertCircle, Info } from "lucide-react"
import clsx from "clsx"

interface Reminder {
  id: string
  title: string
  context: string | null
  priority: string
  dueAt: string | null
  createdAt: string
}

function priorityColor(p: string) {
  switch (p) {
    case "high": return { dot: "bg-error", bg: "bg-error/5 border-error/15", text: "text-error" }
    case "medium": return { dot: "bg-secondary", bg: "bg-secondary/5 border-secondary/15", text: "text-secondary" }
    default: return { dot: "bg-tertiary", bg: "bg-tertiary/5 border-tertiary/15", text: "text-tertiary" }
  }
}

function priorityIcon(p: string) {
  switch (p) {
    case "high": return <AlertCircle className="w-4 h-4" />
    case "medium": return <Clock className="w-4 h-4" />
    default: return <Info className="w-4 h-4" />
  }
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/v1/reminders")
      if (res.ok) setReminders(await res.json())
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
    const interval = setInterval(fetchReminders, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const dismiss = async (id: string) => {
    await fetch("/api/v1/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismiss: id }),
    })
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-secondary hover:scale-105 transition-all relative"
      >
        <Bell className="w-5 h-5" />
        {reminders.length > 0 && (
          <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {reminders.length > 9 ? "9+" : reminders.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-80 md:w-96 max-h-[70vh] glass-panel border border-white/30 rounded-3xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-outline-variant/20">
            <h3 className="text-label-lg font-bold text-on-surface">Reminders</h3>
            <p className="text-xs text-on-surface-variant/70">
              {loading ? "Loading..." : `${reminders.length} active`}
            </p>
          </div>
          <div className="overflow-y-auto max-h-[50vh] p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
                <p className="text-sm text-on-surface-variant/70">No reminders</p>
              </div>
            ) : (
              reminders.map((r) => {
                const colors = priorityColor(r.priority)
                return (
                  <div
                    key={r.id}
                    className={clsx("flex items-start gap-3 p-3 rounded-2xl border transition-all group", colors.bg)}
                  >
                    <span className={clsx("mt-0.5 shrink-0", colors.text)}>
                      {priorityIcon(r.priority)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={clsx("text-sm font-semibold", colors.text)}>{r.title}</p>
                      {r.context && (
                        <p className="text-xs text-on-surface-variant/80 mt-0.5 line-clamp-2">{r.context}</p>
                      )}
                      {r.dueAt && (
                        <p className="text-[10px] text-on-surface-variant/60 mt-1 font-mono">
                          Due: {new Date(r.dueAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => dismiss(r.id)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant/50 hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
