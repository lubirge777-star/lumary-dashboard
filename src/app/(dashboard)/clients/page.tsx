"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"
import { ClientsPage } from "@/components/clients/clients-page"
import {
  Users, Plus, X, Loader2, AlertCircle, RefreshCw, Save, ArrowUpRight, Check, UserPlus,
  MessageSquare, Mail, Link, Globe, MessageCircle,
} from "lucide-react"

const TABS = ["clients", "referrals", "network"] as const
type Tab = (typeof TABS)[number]

const TAB_LABELS: Record<Tab, string> = {
  clients: "Clients",
  referrals: "Referrals",
  network: "Network",
}

// ─── Referrals Tab ───────────────────────────────────────────────────────────

const STATUS_FLOW = ["asked", "connected", "converted", "closed"] as const
const STATUS_COLORS: Record<string, string> = {
  asked: "bg-amber-100 text-amber-700",
  connected: "bg-blue-100 text-blue-700",
  converted: "bg-emerald-100 text-emerald-700",
  closed: "bg-surface-container-highest text-on-surface-variant",
}

function ReferralsTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [clientId, setClientId] = useState("")
  const [referredName, setReferredName] = useState("")
  const [referredPhone, setReferredPhone] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["referrals"],
    queryFn: () => fetch("/api/v1/referrals").then((r) => r.json()),
  })

  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: () => fetch("/api/v1/clients").then((r) => r.json()),
  })

  const referrals: any[] = data?.data ?? data?.items ?? []
  const clients: any[] = clientsData?.items ?? clientsData?.data ?? []

  const createReferral = useMutation({
    mutationFn: (body: object) =>
      fetch("/api/v1/referrals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] })
      setShowForm(false); setClientId(""); setReferredName(""); setReferredPhone("")
      toast("success", "Referral Logged")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const advanceStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/v1/referrals`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ referralId: id, status }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["referrals"] }); toast("success", "Status Updated") },
  })

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load referrals</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><UserPlus className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Referral Tracking</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Referral"}
        </button>
      </div>

      {!isLoading && referrals.length > 0 && (
        <div className="grid grid-cols-4 gap-gutter">
          {STATUS_FLOW.map((s) => (
            <div key={s} className="glass-card p-card-padding text-center">
              <p className={clsx("text-xl font-bold capitalize", s === "converted" ? "text-emerald-600" : s === "closed" ? "text-on-surface-variant" : "text-primary")}>{referrals.filter((r: any) => r.status === s).length}</p>
              <p className="text-[10px] text-on-surface-variant/70 capitalize mt-1">{s}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary">
            <option value="">Select referring client...</option>
            {clients.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input value={referredName} onChange={(e) => setReferredName(e.target.value)} placeholder="Referred person's name" className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
            <input value={referredPhone} onChange={(e) => setReferredPhone(e.target.value)} placeholder="Phone (optional)" className="bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
          </div>
          <button onClick={() => createReferral.mutate({ clientId, referredName, referredPhone })} disabled={!clientId || !referredName || createReferral.isPending} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
            {createReferral.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Log Referral
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="glass-card p-card-padding"><div className="h-4 w-48 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : referrals.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><UserPlus className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No referrals yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Track who referred whom to grow your network</p>
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.map((r: any) => {
            const currentIdx = STATUS_FLOW.indexOf(r.status as any)
            return (
              <div key={r.id} className="glass-card p-card-padding">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-on-surface">{r.referredName || "Unknown"}</h4>
                      {r.referredPhone && <span className="text-xs text-on-surface-variant/60">{r.referredPhone}</span>}
                    </div>
                    {r.client?.name && <p className="text-xs text-on-surface-variant/70 mt-0.5">Referred by <strong>{r.client.name}</strong></p>}
                  </div>
                  <select
                    value={r.status}
                    onChange={(e) => advanceStatus.mutate({ id: r.id, status: e.target.value })}
                    className={clsx("px-2.5 py-1 rounded-lg text-xs font-bold border-none cursor-pointer", STATUS_COLORS[r.status] || "bg-surface-container-highest")}
                  >
                    {STATUS_FLOW.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  {STATUS_FLOW.map((s, i) => (
                    <div key={s} className="flex items-center gap-1 flex-1">
                      <div className={clsx(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                        i <= currentIdx ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant/50"
                      )}>
                        {i < currentIdx ? <Check className="w-3 h-3" /> : i === currentIdx ? <ArrowUpRight className="w-3 h-3" /> : i + 1}
                      </div>
                      {i < STATUS_FLOW.length - 1 && <div className={clsx("flex-1 h-0.5", i < currentIdx ? "bg-primary" : "bg-surface-container-highest")} />}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Network Tab ─────────────────────────────────────────────────────────────

const PLATFORMS = ["linkedin", "whatsapp", "twitter", "email", "other"] as const
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  linkedin: <Globe className="w-3.5 h-3.5" />, whatsapp: <MessageCircle className="w-3.5 h-3.5" />,
  twitter: <MessageSquare className="w-3.5 h-3.5" />, email: <Mail className="w-3.5 h-3.5" />, other: <Link className="w-3.5 h-3.5" />,
}

interface Contact {
  id: string; name: string; company?: string | null; role?: string | null
  notes?: string | null; platform: string; profileUrl?: string | null; lastContacted?: string | null; createdAt: string
}

function NetworkTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState(""); const [company, setCompany] = useState(""); const [role, setRole] = useState("")
  const [notes, setNotes] = useState(""); const [platform, setPlatform] = useState("linkedin"); const [profileUrl, setProfileUrl] = useState("")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["contacts"], queryFn: () => fetch("/api/v1/contacts").then((r) => r.json()),
  })
  const contacts: Contact[] = data?.items ?? []

  const createContact = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["contacts"] }); setShowForm(false); setName(""); setCompany(""); setRole(""); setNotes(""); setProfileUrl(""); toast("success", "Contact Added") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load contacts</h3>
        <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Networking CRM</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Contact"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
              {PLATFORMS.map((p) => (<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>))}
            </select>
            <input type="text" value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="Profile URL" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none" />
          <div className="flex justify-end">
            <button onClick={() => createContact.mutate({ name, company: company || undefined, role: role || undefined, platform, profileUrl: profileUrl || undefined, notes: notes || undefined })} disabled={!name.trim() || createContact.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
              {createContact.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Add Contact
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="glass-card p-card-padding space-y-3"><div className="h-4 w-32 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-20 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><Users className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No contacts yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Build your network by adding your first contact</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {contacts.map((c) => (
            <div key={c.id} className="glass-card p-card-padding card-hover flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">{c.name}</h3>
                    {(c.role || c.company) && <p className="text-xs text-on-surface-variant/70">{[c.role, c.company].filter(Boolean).join(" @ ")}</p>}
                  </div>
                </div>
                <span className={clsx("flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium", platform === "linkedin" ? "bg-blue-100 text-blue-700" : platform === "whatsapp" ? "bg-emerald-100 text-emerald-700" : "bg-surface-variant/50 text-on-surface-variant")}>
                  {PLATFORM_ICONS[c.platform] || PLATFORM_ICONS.other}{c.platform}
                </span>
              </div>
              {c.notes && <p className="text-xs text-on-surface-variant/80 mt-1 line-clamp-2">{c.notes}</p>}
              <div className="mt-auto pt-3 border-t border-outline-variant/10 flex items-center justify-between">
                {c.lastContacted && <span className="text-[11px] text-on-surface-variant/70">Last: {new Date(c.lastContacted).toLocaleDateString()}</span>}
                {c.profileUrl && <a href={c.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View →</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page with Tabs ─────────────────────────────────────────────────────

export default function ClientsRoute() {
  useEffect(() => { document.title = "Clients — LUMARY Studio" }, [])
  return (
    <Suspense fallback={null}>
      <ClientsPageInner />
    </Suspense>
  )
}

function ClientsPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const tab = ((searchParams.get("tab") as Tab) || "clients")

  const setTab = (t: Tab) => {
    router.replace(`${pathname}?tab=${t}`, { scroll: false })
  }

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex gap-1 bg-surface-container-highest/50 rounded-2xl p-1 w-fit">
        {TABS.map((t) => {
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                active
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant/70 hover:text-on-surface"
              )}
            >
              {TAB_LABELS[t]}
            </button>
          )
        })}
      </div>

      {tab === "clients" && <ClientsPage />}
      {tab === "referrals" && <ReferralsTab />}
      {tab === "network" && <NetworkTab />}
    </div>
  )
}
