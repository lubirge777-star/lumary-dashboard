"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Settings as SettingsIcon, MessageSquare, Webhook, Download, Save, Check, X, Users, Trash2, ShieldAlert, Smartphone, RefreshCw, LogOut, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRole } from "@/components/use-role"
import { RoleBadge } from "@/components/use-role"
import { exportToCSV } from "@/lib/export"
import { useToast } from "@/components/ui/toast"
import type { UserRole } from "@/types"

const quickReplyPresets = [
  { key: "greeting", label: "Greeting", template: "Habari! Karibu LUMARY Studio. Ningekusaidiaje leo?" },
  { key: "pricing", label: "Pricing Request", template: "Asante kwa kuuliza. Haya ndio maelezo ya bei zetu..." },
  { key: "followup", label: "Follow Up", template: "Habari! Nilikuwa nakuangalia kuhusu mradi wako. Uko tayari kuanza?" },
  { key: "thanks", label: "Thank You", template: "Asante sana! Tunafurahi kufanya kazi nawe." },
]

const services = ["Brand Starter", "Social Media Pack", "CV Redesign", "Thumbnails", "Weekly Promo Pack"]
const defaultPricing: Record<string, number> = {
  "Brand Starter": 150000,
  "Social Media Pack": 120000,
  "CV Redesign": 10000,
  "Thumbnails": 5000,
  "Weekly Promo Pack": 80000,
}

type Tab = "pricing" | "quick-reply" | "integrations" | "backup" | "users"

interface UserItem {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export default function SettingsPage() {
  useEffect(() => { document.title = "Settings — LUMARY Studio" }, [])
  const [pricing, setPricing] = useState(defaultPricing)
  const [activeTab, setActiveTab] = useState<Tab>("pricing")
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { data: session } = useSession()
  const role = useRole()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<UserRole>("AGENT")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data: settings, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetch("/api/v1/settings").then((r) => r.json()),
  })

  const { data: users = [], isLoading: usersLoading } = useQuery<UserItem[]>({
    queryKey: ["users"],
    queryFn: () => fetch("/api/v1/users").then((r) => r.json()),
    enabled: role === "OWNER",
  })

  const [waState, setWaState] = useState<string>("checking")
  const [waQR, setWaQR] = useState<string | null>(null)

  const checkWA = async () => {
    try {
      const res = await fetch("/api/v1/whatsapp/status")
      const data = await res.json()
      setWaState(data.state || "close")
      if (data.state === "connecting" || data.state === "close") {
        const qrRes = await fetch("/api/v1/whatsapp/qr")
        const qrData = await qrRes.json()
        setWaQR(qrData.qr || null)
      } else {
        setWaQR(null)
      }
    } catch { setWaState("close") }
  }

  useEffect(() => { checkWA(); const i = setInterval(checkWA, 5000); return () => clearInterval(i) }, [])

  const integrations = [
    { name: "WhatsApp (Baileys)", status: waState === "open" ? "connected" : waState === "connecting" ? "pending" : "disconnected", desc: waState === "open" ? "Connected and ready" : waState === "connecting" ? "Scan QR to connect" : "Disconnected" },
    { name: "Chatwoot", status: "disconnected", desc: "Customer support platform" },
    { name: "Typebot", status: "disconnected", desc: "Chatbot automation" },
  ]

  const tabs = [
    { key: "pricing" as Tab, label: "Pricing", icon: SettingsIcon },
    { key: "quick-reply" as Tab, label: "Quick Replies", icon: MessageSquare },
    { key: "integrations" as Tab, label: "Integrations", icon: Webhook },
    ...(role === "OWNER" ? [{ key: "users" as Tab, label: "Users", icon: Users }] : []),
    { key: "backup" as Tab, label: "Backup", icon: Download },
  ]

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAddUser = async () => {
    if (!newName.trim() || !newEmail.trim()) return
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim(), role: newRole }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast("error", "Failed", err.error || "Failed to create user")
        return
      }
      setNewName("")
      setNewEmail("")
      setNewRole("AGENT")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch {
      toast("error", "Failed", "Failed to create user")
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/v1/users?id=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast("error", "Failed", err.error || "Failed to update role")
        return
      }
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch {
      toast("error", "Failed", "Failed to update role")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/v1/users?id=${userId}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        toast("error", "Failed", err.error || "Failed to delete user")
        return
      }
      setDeleteConfirm(null)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch {
      toast("error", "Failed", "Failed to delete user")
    }
  }

  const currentUserEmail = session?.user?.email

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-on-surface">Settings</h1>
        <p className="text-sm text-on-surface-variant/80 mt-1">Manage pricing, templates, and integrations</p>
      </div>

      <div className="flex gap-1.5 border-b border-outline-variant/30 pb-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-on-surface-variant/80 hover:text-on-surface hover:bg-white/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {settingsLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="animate-shimmer h-24 rounded-2xl bg-surface-container-low" />
          ))}
        </div>
      ) : settingsError ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
            <p className="text-sm text-on-surface-variant/80 mb-3">Failed to load settings</p>
            <button onClick={() => refetchSettings()} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold">Retry</button>
          </div>
        </div>
      ) : (
        <>
          {activeTab === "pricing" && (
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide">Service Pricing</h3>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 animate-fadeIn">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
          <div className="space-y-3">
            {services.map((svc) => (
              <div key={svc} className="group flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-surface-container/40 border border-outline-variant/20 dark:border-white/5 hover:border-primary/10 transition-all">
                <span className="text-sm text-on-surface font-medium">{svc}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant/80 font-mono">TSh</span>
                  <input
                    type="number"
                    value={pricing[svc]}
                    onChange={(e) => setPricing({ ...pricing, [svc]: Number(e.target.value) })}
                    className="w-28 bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-sm text-on-surface text-right font-mono focus:outline-none focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(103,80,164,0.06)] transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all">
            <Save className="w-4 h-4" />
            Save Pricing
          </button>
        </div>
      )}

      {activeTab === "quick-reply" && (
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide">Quick Reply Templates</h3>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 animate-fadeIn">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
          <div className="space-y-4">
            {quickReplyPresets.map((qr) => (
              <div key={qr.key} className="p-4 rounded-xl bg-white/40 dark:bg-surface-container/40 border border-outline-variant/20 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-primary font-semibold uppercase tracking-wider">{qr.label}</span>
                  <span className="text-[10px] text-on-surface-variant/80">/{qr.key}</span>
                </div>
                <textarea
                  rows={2}
                  defaultValue={qr.template}
                  className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/80 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(103,80,164,0.06)] transition-all resize-none"
                />
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all">
            <Save className="w-4 h-4" />
            Save Templates
          </button>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide">Connected Services</h3>
          <div className="space-y-3">
            {integrations.map((int: any) => (
              <div key={int.name} className="group flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-surface-container/40 border border-outline-variant/20 dark:border-white/5 hover:border-primary/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    int.status === "connected" ? "bg-emerald-100" : int.status === "pending" ? "bg-amber-100" : "bg-outline-variant/30"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      int.status === "connected" ? "bg-emerald-600" : int.status === "pending" ? "bg-amber-500" : "bg-on-surface-variant/60"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-on-surface font-medium">{int.name}</p>
                    <p className="text-xs text-on-surface-variant/80 mt-0.5">{int.desc}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                  int.status === "connected"
                    ? "bg-emerald-100 text-emerald-600"
                    : int.status === "pending"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-outline-variant/30 text-on-surface-variant/80"
                }`}>
                  {int.status === "connected" ? (
                    <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Connected</span>
                  ) : int.status === "pending" ? (
                    <span className="flex items-center gap-1">Pending</span>
                  ) : (
                    <span className="flex items-center gap-1"><X className="w-3 h-3" /> Disconnected</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/30 dark:to-surface-container-high border border-amber-200/50 dark:border-amber-700/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-on-surface">WhatsApp Connection</h4>
              <div className="flex items-center gap-2">
                {waState === "open" ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-semibold">
                    <Smartphone className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : waState === "connecting" ? (
                  <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg font-semibold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Connecting
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg font-semibold">
                    <X className="w-3.5 h-3.5" /> Disconnected
                  </span>
                )}
              </div>
            </div>

            {waState === "open" ? (
              <div className="space-y-3">
                <p className="text-xs text-on-surface-variant/70 leading-relaxed">
                  WhatsApp is connected. Messages are flowing through the dashboard.
                </p>
                <button
                  onClick={async () => { await fetch("/api/v1/whatsapp/disconnect", { method: "POST" }); checkWA() }}
                  className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-xl text-xs font-semibold hover:bg-error/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            ) : waQR ? (
              <div className="space-y-3">
                <p className="text-xs text-on-surface-variant/70 leading-relaxed">
                  Scan this QR code with your WhatsApp app to connect <strong>+{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "255651360763"}</strong>:
                  <br />Open WhatsApp &rarr; Settings &rarr; Linked Devices &rarr; Link a Device
                </p>
                <div className="flex justify-center">
                  <img src={waQR} alt="WhatsApp QR Code" className="w-48 h-48 rounded-xl border border-outline-variant/20" />
                </div>
                <button
                  onClick={checkWA}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh QR
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-on-surface-variant/70 leading-relaxed">
                  Starting WhatsApp connection... Please wait a few seconds and refresh.
                </p>
                <button
                  onClick={checkWA}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:shadow-lg transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Check Status
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "backup" && (
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide">Data Export</h3>
          <div className="p-5 rounded-xl bg-white/40 dark:bg-surface-container/40 border border-outline-variant/20 dark:border-white/5 space-y-4">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Export your data as CSV. Choose what to export below.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: "clients", label: "Clients", endpoint: "/api/v1/clients", columns: [{ key: "name", label: "Name" }, { key: "whatsappNumber", label: "WhatsApp" }, { key: "businessType", label: "Business" }, { key: "status", label: "Status" }, { key: "totalSpent", label: "Total Spent" }] },
                { key: "projects", label: "Projects", endpoint: "/api/v1/projects", columns: [{ key: "clientName", label: "Client" }, { key: "serviceType", label: "Service" }, { key: "status", label: "Status" }, { key: "quotedAmount", label: "Amount" }] },
                { key: "payments", label: "Payments", endpoint: "/api/v1/payments", columns: [{ key: "clientName", label: "Client" }, { key: "amount", label: "Amount" }, { key: "method", label: "Method" }, { key: "status", label: "Status" }, { key: "createdAt", label: "Date" }] },
                { key: "expenses", label: "Expenses", endpoint: "/api/v1/expenses", columns: [{ key: "category", label: "Category" }, { key: "description", label: "Description" }, { key: "amount", label: "Amount" }, { key: "createdAt", label: "Date" }] },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={async () => {
                    setExporting(true)
                    try {
                      const res = await fetch(item.endpoint)
                      const data = await res.json()
                      const items = data.items ?? data ?? []
                      exportToCSV(items, `lumary-${item.key}-${new Date().toISOString().slice(0, 10)}`, item.columns)
                      toast("success", `${item.label} exported`, "CSV file downloaded")
                    } catch {
                      toast("error", "Export failed", `Could not export ${item.label}`)
                    } finally {
                      setExporting(false)
                    }
                  }}
                  disabled={exporting}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/20 hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {exporting ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Download className="w-5 h-5 text-primary" />}
                  </div>
                  <span className="text-xs font-medium text-on-surface">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface tracking-wide">User Management</h3>
            <RoleBadge role={role} />
          </div>

          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-on-surface-variant/80 font-medium mb-1 block">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="User name"
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-on-surface-variant/80 font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-on-surface-variant/80 font-medium mb-1 block">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
              >
                <option value="AGENT">Agent</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            <button
              onClick={handleAddUser}
              disabled={!newName.trim() || !newEmail.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Users className="w-4 h-4" />
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4">Name</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4">Email</th>
                  <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4">Role</th>
                  <th className="text-right text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-on-surface-variant/80">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-on-surface-variant/80">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isCurrentUser = user.email === currentUserEmail
                    return (
                      <tr
                        key={user.id}
                        className={`border-b border-outline-variant/10 transition-all ${
                          isCurrentUser ? "bg-primary/5" : "hover:bg-black/[0.02]"
                        }`}
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-on-surface">{user.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">You</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-on-surface-variant/70">{user.email}</td>
                        <td className="py-3 pr-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            className={`text-xs font-semibold px-2 py-1 rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary/40 transition-all ${
                              user.role === "OWNER"
                                ? "text-amber-600 bg-amber-50"
                                : user.role === "AGENT"
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-gray-600 bg-gray-50"
                            }`}
                          >
                            <option value="OWNER">Owner</option>
                            <option value="AGENT">Agent</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                        </td>
                        <td className="py-3 text-right">
                          {user.role !== "OWNER" && (
                            <>
                              {deleteConfirm === user.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-xs text-on-surface-variant/80">Confirm?</span>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-error text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-3 py-1.5 bg-outline-variant/20 text-on-surface-variant rounded-lg text-xs font-semibold hover:bg-outline-variant/30 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(user.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-on-surface-variant/80 hover:text-error rounded-lg text-xs font-semibold hover:bg-error/5 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                          {user.role === "OWNER" && (
                            <span className="flex items-center justify-end gap-1 text-xs text-amber-600">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Protected
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  )
}
