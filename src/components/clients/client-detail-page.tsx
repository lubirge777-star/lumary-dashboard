"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge, statusBadge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Table } from "@/components/ui/table"
import { formatTSh, maskPhone, formatRelativeDate } from "@/lib/utils"
import type { Client, Message, Project, Payment, Activity, Retainer } from "@/types"
import {
  ArrowLeft, Send, AlertCircle, ExternalLink,
  Phone, Mail, MapPin, UserCheck
} from "lucide-react"

interface ClientWithRelations extends Client {
  projects?: Project[]
  payments?: Payment[]
  messages?: Message[]
  retainers?: Retainer[]
  activities?: Activity[]
}

function ConversationsTab({
  messages,
  clientId,
  whatsappNumber,
}: {
  messages: Message[]
  clientId: string
  whatsappNumber: string
}) {
  const [input, setInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const sendMutation = useMutation({
    mutationFn: (data: { to: string; message: string; clientId: string }) =>
      fetch("/api/v1/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] })
    },
  })

  const handleSend = () => {
    if (!input.trim()) return
    sendMutation.mutate({ to: whatsappNumber, message: input.trim(), clientId })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50">
        <EmptyState
          title="No conversations yet"
          description="Messages will appear here once you start chatting with this client"
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50 overflow-hidden">
      <div className="h-[500px] overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isInbound = msg.direction === "inbound"
          return (
            <div key={msg.id} className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[75%] ${
                  isInbound ? "bg-surface-container-highest/50" : "bg-primary/10"
                } rounded-2xl px-4 py-2.5`}
              >
                <p className="text-sm text-on-surface whitespace-pre-wrap">{msg.content}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-on-surface-variant/70">
                    {new Date(msg.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      msg.channel === "whatsapp"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    {msg.channel}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-outline-variant/30 dark:border-white/5 p-3 bg-white dark:bg-surface-container-high">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-surface-container-highest/30 border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button size="sm" onClick={handleSend} disabled={!input.trim() || sendMutation.isPending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProjectsTab({ projects }: { projects: Project[] }) {
  const columns = [
    {
      key: "serviceType",
      label: "Service Type",
      render: (p: Project) => <span className="text-sm font-medium text-on-surface">{p.serviceType}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p: Project) => <Badge variant={statusBadge(p.status)}>{p.status}</Badge>,
    },
    {
      key: "quotedAmount",
      label: "Amount",
      sortable: true,
      render: (p: Project) => (
        <span className="text-sm font-mono font-semibold text-on-surface">{formatTSh(p.quotedAmount)}</span>
      ),
    },
    {
      key: "depositAmount",
      label: "Deposit",
      render: (p: Project) => (
        <span className="text-sm font-mono text-on-surface-variant">
          {p.depositAmount ? formatTSh(p.depositAmount) : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Dates",
      sortable: true,
      render: (p: Project) => (
        <div className="text-xs text-on-surface-variant/70">
          <span>Created {formatRelativeDate(new Date(p.createdAt))}</span>
          {p.finalDeliveredAt && (
            <span className="block">Delivered {formatRelativeDate(new Date(p.finalDeliveredAt))}</span>
          )}
        </div>
      ),
    },
  ]

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50">
        <EmptyState title="No projects" description="This client doesn't have any projects yet" />
      </div>
    )
  }

  return <Table columns={columns} data={projects} />
}

function PaymentsTab({ payments }: { payments: Payment[] }) {
  const columns = [
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (p: Payment) => (
        <span className="text-sm text-on-surface-variant">
          {p.paidAt ? formatRelativeDate(new Date(p.paidAt)) : formatRelativeDate(new Date(p.createdAt))}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (p: Payment) => (
        <span className="text-sm font-mono font-semibold text-on-surface">{formatTSh(p.amount)}</span>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (p: Payment) => (
        <span className="text-sm text-on-surface-variant">{p.method}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p: Payment) => <Badge variant={statusBadge(p.status)}>{p.status}</Badge>,
    },
    {
      key: "mpesaReference",
      label: "Reference",
      render: (p: Payment) => (
        <span className="text-xs font-mono text-on-surface-variant/80">
          {p.mpesaReference || "—"}
        </span>
      ),
    },
  ]

  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50">
        <EmptyState title="No payments" description="This client hasn't made any payments yet" />
      </div>
    )
  }

  return <Table columns={columns} data={payments} />
}

function ActivityTab({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50">
        <EmptyState
          title="No activity"
          description="No recent activity recorded for this client"
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50 p-6">
      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-outline-variant/30" />
        <div className="space-y-5">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-4 relative">
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest/50 border border-outline-variant/20 flex items-center justify-center text-base shrink-0 z-10">
                {a.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-on-surface">{a.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-on-surface-variant/70">
                    {formatRelativeDate(new Date(a.createdAt))}
                  </span>
                  {a.actorName && (
                    <span className="text-xs text-on-surface-variant/70">by {a.actorName}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClientInfoHeader({ client, onBack }: { client: Client; onBack: () => void }) {
  return (
    <div className="rounded-3xl border border-outline-variant/30 dark:border-white/5 bg-white/95 dark:bg-surface-container-high/95 backdrop-blur-2xl p-6 space-y-5">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-black/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
        </button>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-lg font-semibold shrink-0">
          {client.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-headline-lg text-on-surface font-bold truncate">{client.name}</h1>
            <Badge variant={statusBadge(client.status)}>{client.status}</Badge>
          </div>
          {client.businessType && (
            <p className="text-sm text-on-surface-variant/70 mt-0.5">{client.businessType}</p>
          )}
        </div>
        <a
          href={`/portal/${client.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant/30 dark:border-white/5 bg-white dark:bg-surface-container-high text-xs font-medium text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Client Portal
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {client.whatsappNumber && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Phone className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="font-mono truncate">{maskPhone(client.whatsappNumber)}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Mail className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.location && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="truncate">{client.location}</span>
          </div>
        )}
        {client.referralSource && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <UserCheck className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="truncate">Referred by: {client.referralSource}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/20">
        <div>
          <p className="text-xs text-on-surface-variant/80">Total Spent</p>
          <p className="text-lg font-semibold text-on-surface">{formatTSh(client.totalSpent)}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant/80">First Project</p>
          <p className="text-sm font-medium text-on-surface">
            {client.firstProjectDate ? formatRelativeDate(new Date(client.firstProjectDate)) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant/80">Last Project</p>
          <p className="text-sm font-medium text-on-surface">
            {client.lastProjectDate ? formatRelativeDate(new Date(client.lastProjectDate)) : "—"}
          </p>
        </div>
      </div>

      {client.notes && (
        <div className="pt-4 border-t border-outline-variant/20">
          <p className="text-xs text-on-surface-variant/80 mb-1.5">Notes</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">{client.notes}</p>
        </div>
      )}
    </div>
  )
}

export function ClientDetailPage({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [tab, setTab] = useState("conversations")

  const { data, isLoading, error } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => fetch(`/api/v1/clients/${clientId}`).then((r) => {
      if (!r.ok) throw new Error("Client not found")
      return r.json()
    }),
    enabled: !!clientId,
  })

  const client = data as ClientWithRelations | undefined

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="rounded-3xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5" />
            ))}
          </div>
          <div className="flex gap-6 pt-4 border-t border-outline-variant/20">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center min-h-[500px] animate-fadeIn">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Client not found</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">The client you&apos;re looking for doesn&apos;t exist or has been removed</p>
          <Button onClick={() => router.push("/clients")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </Button>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: "conversations", label: "Conversations", count: client.messages?.length },
    { key: "projects", label: "Projects", count: client.projects?.length },
    { key: "payments", label: "Payments", count: client.payments?.length },
    { key: "activity", label: "Activity", count: client.activities?.length },
  ]

  return (
    <div className="space-y-6 stagger-children">
      <ClientInfoHeader client={client} onBack={() => router.push("/clients")} />

      <div className="flex gap-1 border-b border-outline-variant/30">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant/80 hover:text-on-surface-variant hover:border-outline-variant"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                  tab === t.key
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container-highest/50 text-on-surface-variant/80"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="animate-fadeIn">
        {tab === "conversations" && (
          <ConversationsTab
            messages={client.messages ?? []}
            clientId={client.id}
            whatsappNumber={client.whatsappNumber}
          />
        )}
        {tab === "projects" && <ProjectsTab projects={client.projects ?? []} />}
        {tab === "payments" && <PaymentsTab payments={client.payments ?? []} />}
        {tab === "activity" && <ActivityTab activities={client.activities ?? []} />}
      </div>
    </div>
  )
}
