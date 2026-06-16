"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  BookOpen, Save, Trash2, Loader2, AlertCircle, RefreshCw,
  MessageSquare, Target, Heart, Download,
} from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const CATEGORIES = [
  { value: "daily", label: "Daily Reflection", icon: MessageSquare },
  { value: "learn", label: "Learning", icon: BookOpen },
  { value: "project", label: "Project", icon: Target },
  { value: "deen", label: "Deen", icon: Heart },
  { value: "mary", label: "Mary", icon: Heart },
  { value: "goal", label: "Goals", icon: Target },
] as const

const CATEGORY_COLORS: Record<string, string> = {
  daily: "bg-primary/10 text-primary",
  learn: "bg-secondary/10 text-secondary",
  project: "bg-tertiary/10 text-tertiary",
  deen: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  mary: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  goal: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export default function JournalPage() {
  useEffect(() => { document.title = "Journal — LUMARY Studio" }, [])

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [category, setCategory] = useState("daily")
  const [content, setContent] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => fetchJson("/api/v1/journal-entries"),
  })

  const entries: any[] = data?.items ?? []

  const createEntry = useMutation({
    mutationFn: (data: { category: string; content: string }) =>
      fetchJson("/api/v1/journal-entries", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] })
      setContent("")
      toast("success", "Entry Saved", "Your journal entry has been recorded")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const deleteEntry = useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/journal-entries?id=${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] })
      toast("success", "Entry Deleted", "The journal entry has been removed")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `journal-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast("success", "Exported", "Journal entries downloaded as JSON")
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load journal</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-gutter animate-fadeIn">
      {/* New Entry */}
      <div className="glass-card p-card-padding">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-headline-md font-bold text-on-surface">New Entry</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = category === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  isActive
                    ? "bg-primary text-on-primary shadow-lg"
                    : "text-on-surface-variant bg-surface-container-low hover:bg-surface-variant/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            )
          })}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today?"
          rows={4}
          className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none mb-4"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-on-surface-variant/70">
            {content.length > 0 && `${content.length} characters`}
          </p>
          <button
            onClick={() => createEntry.mutate({ category, content })}
            disabled={!content.trim() || createEntry.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {createEntry.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Entry
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="glass-card p-card-padding">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-headline-md font-bold text-on-surface">Entries</h3>
            {!isLoading && (
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                {entries.length}
              </span>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-on-surface-variant text-sm font-semibold hover:bg-surface-variant/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-shimmer h-24 rounded-xl bg-surface-container-low" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-on-surface-variant/70" />
            </div>
            <p className="text-sm font-medium text-on-surface-variant/80">No entries yet. Write your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry: any) => {
              const isExpanded = expandedId === entry.id
              const colorClass = CATEGORY_COLORS[entry.category] || "bg-surface-variant/50 text-on-surface-variant"
              const catLabel = CATEGORIES.find((c) => c.value === entry.category)?.label || entry.category

              return (
                <div
                  key={entry.id}
                  className="rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-black/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={clsx("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0", colorClass)}>
                        {catLabel}
                      </span>
                      <span className="text-xs text-on-surface-variant/70 shrink-0">{formatDate(entry.createdAt)}</span>
                      <p className="text-sm text-on-surface truncate">
                        {entry.content.length > 80 ? `${entry.content.slice(0, 80)}...` : entry.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm("Delete this entry?")) deleteEntry.mutate(entry.id)
                        }}
                        className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant/70 hover:text-error transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-outline-variant/10 animate-fadeIn">
                      <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
