"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CalendarCheck, Plus, X, Loader2, AlertCircle, RefreshCw,
  Smartphone, Film, MessageCircle, Globe, Play, Share2,
  CheckCircle, Clock, Pen, Ban,
} from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const PLATFORMS = ["TikTok", "Instagram", "Facebook", "YouTube", "WhatsApp"] as const
const PILLARS = ["Portfolio", "Education", "Personal", "Engagement"] as const
const STATUSES = ["draft", "scheduled", "posted", "cancelled"] as const

type ContentStatus = (typeof STATUSES)[number]

interface ContentItem {
  id: string
  platform: string
  pillar: string
  content: string
  scheduledDate: string
  status: ContentStatus
}

const priorityTiers = [
  { platform: "WhatsApp Status", tier: 1, label: "TIER 1 — NOW" },
  { platform: "TikTok", tier: 1, label: "TIER 1 — NOW" },
  { platform: "Instagram Reels", tier: 2, label: "TIER 2 — Week 2" },
  { platform: "Facebook Groups", tier: 2, label: "TIER 2 — Week 1" },
  { platform: "YouTube", tier: 3, label: "TIER 3 — Month 2" },
  { platform: "LinkedIn", tier: 3, label: "TIER 3 — Week 2" },
  { platform: "Facebook Page", tier: 4, label: "TIER 4 — Month 1" },
]

const weeklySchedule: { day: string; items: { platform: string; icon: string }[] }[] = [
  { day: "Mon", items: [{ platform: "TikTok", icon: "video" }, { platform: "Instagram Story", icon: "instagram" }, { platform: "Facebook Groups", icon: "facebook" }, { platform: "WhatsApp Status", icon: "whatsapp" }] },
  { day: "Tue", items: [{ platform: "TikTok", icon: "video" }, { platform: "Instagram Story", icon: "instagram" }, { platform: "WhatsApp Status", icon: "whatsapp" }] },
  { day: "Wed", items: [{ platform: "TikTok", icon: "video" }, { platform: "Instagram Reels", icon: "instagram" }, { platform: "Instagram Story", icon: "instagram" }, { platform: "Instagram Carousel", icon: "instagram" }, { platform: "Facebook Groups", icon: "facebook" }, { platform: "WhatsApp Status", icon: "whatsapp" }] },
  { day: "Thu", items: [{ platform: "TikTok", icon: "video" }, { platform: "Instagram Story", icon: "instagram" }, { platform: "YouTube Shorts", icon: "youtube" }, { platform: "WhatsApp Status", icon: "whatsapp" }] },
  { day: "Fri", items: [{ platform: "TikTok", icon: "video" }, { platform: "Instagram Reels", icon: "instagram" }, { platform: "Instagram Story", icon: "instagram" }, { platform: "Facebook Groups", icon: "facebook" }, { platform: "WhatsApp Status", icon: "whatsapp" }] },
  { day: "Sat", items: [{ platform: "TikTok", icon: "video" }, { platform: "Instagram Reels", icon: "instagram" }, { platform: "Instagram Story", icon: "instagram" }, { platform: "Instagram Carousel", icon: "instagram" }, { platform: "WhatsApp Status", icon: "whatsapp" }] },
  { day: "Sun", items: [{ platform: "TikTok", icon: "video" }, { platform: "Instagram Story", icon: "instagram" }, { platform: "YouTube Shorts", icon: "youtube" }, { platform: "WhatsApp Status", icon: "whatsapp" }] },
]

const pillarDescriptions = [
  { name: "Pillar 1 — Portfolio", percentage: "30%", description: "Your work, before/after, case studies", color: "grad-orange" },
  { name: "Pillar 2 — Education", percentage: "30%", description: "Tips, tutorials, useful knowledge", color: "grad-blue" },
  { name: "Pillar 3 — Personal Brand", percentage: "20%", description: "Your story, process, entrepreneur narrative", color: "grad-purple" },
  { name: "Pillar 4 — Engagement", percentage: "20%", description: "Questions, polls, opinions", color: "grad-green" },
]

const PlatformIcon = ({ platform, className }: { platform: string; className?: string }) => {
  const lower = platform.toLowerCase()
  if (lower.includes("tiktok")) return <Film className={className} />
  if (lower.includes("instagram")) return <Smartphone className={className} />
  if (lower.includes("facebook")) return <Share2 className={className} />
  if (lower.includes("youtube")) return <Play className={className} />
  if (lower.includes("whatsapp")) return <MessageCircle className={className} />
  if (lower.includes("linkedin")) return <Globe className={className} />
  return <Globe className={className} />
}

const statusIcon = (status: ContentStatus) => {
  switch (status) {
    case "posted": return <CheckCircle className="w-3.5 h-3.5" />
    case "scheduled": return <Clock className="w-3.5 h-3.5" />
    case "draft": return <Pen className="w-3.5 h-3.5" />
    case "cancelled": return <Ban className="w-3.5 h-3.5" />
  }
}

const statusColor = (status: ContentStatus) => {
  switch (status) {
    case "posted": return "text-emerald-600 bg-emerald-100"
    case "scheduled": return "text-blue-600 bg-blue-100"
    case "draft": return "text-amber-600 bg-amber-100"
    case "cancelled": return "text-red-600 bg-red-100"
  }
}

const tierColor = (tier: number) => {
  switch (tier) {
    case 1: return "border-l-red-500 bg-red-50/50"
    case 2: return "border-l-amber-500 bg-amber-50/50"
    case 3: return "border-l-blue-500 bg-blue-50/50"
    case 4: return "border-l-slate-400 bg-slate-50/50"
    default: return "border-l-outline-variant/30"
  }
}

export default function ContentPage() {
  useEffect(() => { document.title = "Content — LUMARY Studio" }, [])

  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [newPlatform, setNewPlatform] = useState<string>("TikTok")
  const [newPillar, setNewPillar] = useState<string>("Portfolio")
  const [newContent, setNewContent] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newStatus, setNewStatus] = useState<ContentStatus>("draft")
  const [editing, setEditing] = useState<ContentItem | null>(null)

  const queryClient = useQueryClient()

  const { data: items = [], isLoading, error, refetch } = useQuery<ContentItem[]>({
    queryKey: ["content-calendar"],
    queryFn: () => fetch("/api/v1/content-calendar").then((r) => r.json()).then((d: any) => d.items ?? d ?? []),
  })

  const createMutation = useMutation({
    mutationFn: (data: Omit<ContentItem, "id">) =>
      fetch("/api/v1/content-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] })
      resetForm()
      toast("success", "Content Created", "New content idea added")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentItem> }) =>
      fetch(`/api/v1/content-calendar?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] })
      resetForm()
      toast("success", "Content Updated", "Content item updated")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const resetForm = () => {
    setShowForm(false)
    setEditing(null)
    setNewPlatform("TikTok")
    setNewPillar("Portfolio")
    setNewContent("")
    setNewDate("")
    setNewStatus("draft")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) return
    const payload = { platform: newPlatform, pillar: newPillar, content: newContent.trim(), scheduledDate: newDate, status: newStatus }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleEdit = (item: ContentItem) => {
    setEditing(item)
    setNewPlatform(item.platform)
    setNewPillar(item.pillar)
    setNewContent(item.content)
    setNewDate(item.scheduledDate)
    setNewStatus(item.status)
    setShowForm(true)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load content calendar</h3>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Content Calendar</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Plan, schedule, and track your social media content across platforms</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Content
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn" onClick={resetForm}>
          <div className="glass-card w-full max-w-lg p-6 animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-headline-md font-bold text-on-surface">
                {editing ? "Edit Content" : "New Content Idea"}
              </h3>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg hover:bg-surface-variant/50 flex items-center justify-center text-on-surface-variant">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Platform</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                  >
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Content Pillar</label>
                  <select
                    value={newPillar}
                    onChange={(e) => setNewPillar(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                  >
                    {PILLARS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe your content idea..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Scheduled Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ContentStatus)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-medium hover:bg-surface-variant/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 space-y-6">
          <div className="glass-card p-card-padding">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-4">Platform Priority</h3>
            <div className="space-y-2">
              {priorityTiers.map((p) => (
                <div
                  key={p.platform}
                  className={clsx(
                    "flex items-center justify-between p-3 rounded-xl border-l-4 transition-all hover:shadow-sm",
                    tierColor(p.tier)
                  )}
                >
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={p.platform} className="w-4 h-4 text-on-surface-variant/70" />
                    <span className="text-sm font-medium text-on-surface">{p.platform}</span>
                  </div>
                  <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg",
                    p.tier === 1 && "text-red-600 bg-red-100",
                    p.tier === 2 && "text-amber-600 bg-amber-100",
                    p.tier === 3 && "text-blue-600 bg-blue-100",
                    p.tier === 4 && "text-slate-500 bg-slate-100",
                  )}>
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-card-padding">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-4">Content Pillars</h3>
            <div className="space-y-3">
              {pillarDescriptions.map((pillar) => (
                <div key={pillar.name} className="flex items-start gap-3 p-3 rounded-xl bg-white/40 border border-outline-variant/20">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", pillar.color)}>
                    <span className="text-xs font-bold text-white">{pillar.percentage}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{pillar.name}</p>
                    <p className="text-xs text-on-surface-variant/70 mt-0.5">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 space-y-6">
          <div className="glass-card p-card-padding overflow-x-auto">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-4">Weekly Schedule</h3>
            <div className="min-w-[640px]">
              <div className="grid grid-cols-7 gap-2 mb-3">
                {weeklySchedule.map((day) => (
                  <div key={day.day} className="text-center">
                    <div className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider mb-2">{day.day}</div>
                    <div className="space-y-1.5">
                      {day.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/50"
                        >
                          <PlatformIcon platform={item.platform} className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="text-[10px] font-semibold text-emerald-700 truncate leading-tight">{item.platform}</span>
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-card-padding">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-on-surface tracking-wide">Upcoming Content</h3>
              <button
                onClick={() => { resetForm(); setShowForm(true) }}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant/70">
                <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No content yet</p>
                <p className="text-xs mt-1">Add your first content idea to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleEdit(item)}
                    className="w-full text-left p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-low/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <PlatformIcon platform={item.platform} className="w-5 h-5 text-on-surface-variant/70 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-on-surface truncate">{item.platform}</span>
                            <span className="text-[10px] font-semibold text-on-surface-variant/70 bg-surface-variant/50 px-1.5 py-0.5 rounded-full">{item.pillar}</span>
                          </div>
                          <p className="text-sm text-on-surface-variant/80 mt-1 line-clamp-2">{item.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {item.scheduledDate && (
                              <span className="text-xs text-on-surface-variant/80">{item.scheduledDate}</span>
                            )}
                            <span className={clsx(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                              statusColor(item.status)
                            )}>
                              {statusIcon(item.status)}
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Pen className="w-4 h-4 text-on-surface-variant/80 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
