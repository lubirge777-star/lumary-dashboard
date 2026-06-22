"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Globe, Plus, X, Loader2, AlertCircle, RefreshCw, Save, Trash2, Heart, MessageSquare, Eye, Share2, Bookmark, Check } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const PLATFORMS = ["tiktok", "instagram", "facebook", "youtube", "whatsapp"] as const
const PILLARS = ["portfolio", "education", "personal", "engagement"] as const
const STATUSES = ["draft", "scheduled", "posted"] as const

const PLATFORM_EMOJIS: Record<string, string> = { tiktok: "🎵", instagram: "📸", facebook: "👍", youtube: "▶️", whatsapp: "💬" }
const PILLAR_COLORS: Record<string, string> = {
  portfolio: "bg-primary/10 text-primary",
  education: "bg-blue-100 text-blue-700",
  personal: "bg-purple-100 text-purple-700",
  engagement: "bg-emerald-100 text-emerald-700",
}

export default function SocialPage() {
  useEffect(() => { document.title = "Social — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [tab, setTab] = useState<"posts" | "collabs" | "analytics">("posts")
  const [showForm, setShowForm] = useState(false)
  const [platform, setPlatform] = useState(""); const [pillar, setPillar] = useState(""); const [contentType, setContentType] = useState("")
  const [title, setTitle] = useState(""); const [status, setStatus] = useState("draft")
  const [partnerName, setPartnerName] = useState(""); const [partnerHandle, setPartnerHandle] = useState(""); const [collabPlatform, setCollabPlatform] = useState(""); const [collabOffer, setCollabOffer] = useState("")

  const { data: postsData, isLoading: postsLoading, error: postsError, refetch: refetchPosts } = useQuery({
    queryKey: ["social-posts"], queryFn: () => fetch("/api/v1/social/posts").then((r) => r.json()),
  })
  const { data: collabsData, isLoading: collabsLoading, error: collabsError, refetch: refetchCollabs } = useQuery({
    queryKey: ["social-collabs"], queryFn: () => fetch("/api/v1/social/collabs").then((r) => r.json()),
  })
  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ["social-analytics"], queryFn: () => fetch("/api/v1/social/analytics").then((r) => r.json()),
  })

  const posts: any[] = postsData?.data ?? postsData?.items ?? []
  const collabs: any[] = collabsData?.data ?? collabsData?.items ?? []
  const summary: any = analytics?.data ?? analytics ?? {}

  const createPost = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/social/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["social-posts"] }); setShowForm(false); resetForm(); toast("success", "Post Created") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
  const deletePost = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/social/posts?id=${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["social-posts"] }); toast("success", "Post Deleted") },
  })
  const createCollab = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/social/collabs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["social-collabs"] }); setShowForm(false); setPartnerName(""); setPartnerHandle(""); setCollabPlatform(""); setCollabOffer(""); toast("success", "Collab Created") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  function resetForm() { setPlatform(""); setPillar(""); setContentType(""); setTitle(""); setStatus("draft") }

  const errorState = postsError || collabsError
  const loading = postsLoading || collabsLoading

  if (errorState && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing</p>
          <button onClick={() => { refetchPosts(); refetchCollabs() }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Globe className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Social Media</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-highest/50 rounded-xl p-1">
        {(["posts", "collabs", "analytics"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={clsx("flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize", tab === t ? "bg-white dark:bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface-variant/70 hover:text-on-surface")}>{t}</button>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          {tab === "posts" ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary">
                  <option value="">Platform</option>{PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={pillar} onChange={(e) => setPillar(e.target.value)} className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary">
                  <option value="">Pillar</option>{PILLARS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary">
                  <option value="">Type</option>
                  <option value="reel">Reel</option><option value="carousel">Carousel</option>
                  <option value="story">Story</option><option value="feed">Feed</option><option value="status">Status</option>
                </select>
              </div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title or description" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
              <button onClick={() => createPost.mutate({ platform, pillar, contentType, title, status })} disabled={!platform || !pillar || !contentType || createPost.isPending} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
                {createPost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Create Post
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Partner name" className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
                <input value={partnerHandle} onChange={(e) => setPartnerHandle(e.target.value)} placeholder="Handle (optional)" className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={collabPlatform} onChange={(e) => setCollabPlatform(e.target.value)} className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary">
                  <option value="">Platform</option>{PLATFORMS.filter((p) => p !== "youtube" && p !== "whatsapp").map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <textarea value={collabOffer} onChange={(e) => setCollabOffer(e.target.value)} placeholder="What you offered them" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary min-h-[80px]" />
              <button onClick={() => createCollab.mutate({ partnerName, partnerHandle, platform: collabPlatform, offer: collabOffer })} disabled={!partnerName || !collabPlatform || !collabOffer || createCollab.isPending} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
                {createCollab.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Log Collab
              </button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {tab === "posts" && (
        loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="glass-card p-card-padding"><div className="h-4 w-48 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><Globe className="w-7 h-7 text-on-surface-variant/80" /></div>
            <h3 className="text-base font-semibold text-on-surface mb-1.5">No posts yet</h3>
            <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Track your content strategy here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p: any) => (
              <div key={p.id} className="glass-card p-card-padding">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{PLATFORM_EMOJIS[p.platform] || "🌐"}</span>
                    <span className={clsx("px-2 py-0.5 rounded-lg text-[10px] font-bold", PILLAR_COLORS[p.pillar] || "bg-surface-container-highest text-on-surface-variant")}>{p.pillar}</span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-surface-container-highest text-on-surface-variant">{p.contentType}</span>
                    <span className={clsx("px-2 py-0.5 rounded-lg text-[10px] font-bold", p.status === "posted" ? "bg-emerald-100 text-emerald-700" : p.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-surface-container-highest text-on-surface-variant")}>{p.status}</span>
                  </div>
                  <button onClick={() => deletePost.mutate(p.id)} className="p-1.5 rounded-lg hover:bg-error-container/50 text-on-surface-variant/50 hover:text-error transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
                {p.title && <p className="text-sm text-on-surface mb-2">{p.title}</p>}
                <div className="flex gap-4 text-xs text-on-surface-variant/70">
                  {p.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{p.views}</span>}
                  {p.likes > 0 && <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{p.likes}</span>}
                  {p.comments > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{p.comments}</span>}
                  {p.saves > 0 && <span className="flex items-center gap-1"><Bookmark className="w-3.5 h-3.5" />{p.saves}</span>}
                  {p.shares > 0 && <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" />{p.shares}</span>}
                  {p.dmsReceived > 0 && <span className="flex items-center gap-1">💬{p.dmsReceived}</span>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "collabs" && (
        collabsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="glass-card p-card-padding"><div className="h-4 w-48 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
          </div>
        ) : collabs.length === 0 ? (
          <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><Globe className="w-7 h-7 text-on-surface-variant/80" /></div>
            <h3 className="text-base font-semibold text-on-surface mb-1.5">No collaborations yet</h3>
            <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Track partnership outreach here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collabs.map((c: any) => (
              <div key={c.id} className="glass-card p-card-padding">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{PLATFORM_EMOJIS[c.platform] || "🌐"}</span>
                      <h4 className="text-sm font-semibold text-on-surface">{c.partnerName}</h4>
                      {c.partnerHandle && <span className="text-xs text-on-surface-variant/60">@{c.partnerHandle}</span>}
                    </div>
                    <p className="text-xs text-on-surface-variant/70 mt-1">{c.offer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.accepted ? <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700">Accepted</span> : <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700">Pending</span>}
                    {c.convertedToClient && <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary">Client</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "analytics" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div className="glass-card p-card-padding text-center"><p className="text-xs text-on-surface-variant/70 mb-1">Total Posts</p><p className="text-2xl font-bold text-on-surface">{summary.totalPosts ?? 0}</p></div>
          <div className="glass-card p-card-padding text-center"><p className="text-xs text-on-surface-variant/70 mb-1">Views</p><p className="text-2xl font-bold text-on-surface">{summary.totalViews ?? 0}</p></div>
          <div className="glass-card p-card-padding text-center"><p className="text-xs text-on-surface-variant/70 mb-1">Likes</p><p className="text-2xl font-bold text-on-surface">{summary.totalLikes ?? 0}</p></div>
          <div className="glass-card p-card-padding text-center"><p className="text-xs text-on-surface-variant/70 mb-1">Engagement</p><p className="text-2xl font-bold text-on-surface">{(summary.totalLikes ?? 0) + (summary.totalComments ?? 0)}</p></div>
          {summary.byPlatform && (
            <div className="glass-card p-card-padding col-span-2">
              <p className="text-xs text-on-surface-variant/70 mb-3">By Platform</p>
              <div className="space-y-2">
                {Object.entries(summary.byPlatform).map(([k, v]: any) => (
                    <div key={k} className="flex items-center gap-2"><span className="text-xs font-semibold text-on-surface capitalize w-24">{k}</span><div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(v / Math.max(...(Object.values(summary.byPlatform as any) as number[]))) * 100}%` }} /></div><span className="text-xs text-on-surface-variant/70">{v}</span></div>
                ))}
              </div>
            </div>
          )}
          {summary.byPillar && (
            <div className="glass-card p-card-padding col-span-2">
              <p className="text-xs text-on-surface-variant/70 mb-3">By Pillar</p>
              <div className="space-y-2">
                {Object.entries(summary.byPillar).map(([k, v]: any) => (
                    <div key={k} className="flex items-center gap-2"><span className="text-xs font-semibold text-on-surface capitalize w-24">{k}</span><div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(v / Math.max(...(Object.values(summary.byPillar as any) as number[]))) * 100}%` }} /></div><span className="text-xs text-on-surface-variant/70">{v}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
