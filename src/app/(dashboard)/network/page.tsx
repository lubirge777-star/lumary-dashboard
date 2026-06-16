"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Users, Plus, X, Loader2, AlertCircle, RefreshCw, Save, MessageSquare, Mail, Link, Globe, MessageCircle } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const PLATFORMS = ["linkedin", "whatsapp", "twitter", "email", "other"] as const
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  linkedin: <Globe className="w-3.5 h-3.5" />, whatsapp: <MessageCircle className="w-3.5 h-3.5" />,
  twitter: <MessageSquare className="w-3.5 h-3.5" />, email: <Mail className="w-3.5 h-3.5" />, other: <Link className="w-3.5 h-3.5" />,
}

interface Contact {
  id: string; name: string; company?: string | null; role?: string | null
  notes?: string | null; platform: string; profileUrl?: string | null; lastContacted?: string | null; createdAt: string
}

export default function NetworkPage() {
  useEffect(() => { document.title = "Network — LUMARY Studio" }, [])
  const queryClient = useQueryClient(); const { toast } = useToast()
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
