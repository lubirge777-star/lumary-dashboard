"use client"

import { useState, useMemo, type ReactNode } from "react"
import { useClients, useProjects, usePayments } from "@/lib/api-hooks"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge, statusBadge } from "@/components/ui/badge"
import { formatTSh, formatRelativeDate, maskPhone } from "@/lib/utils"
import { Client, Project, Payment } from "@/types"
import { MessageSquare, ExternalLink, ClipboardList, DollarSign, User } from "lucide-react"

function OverviewTab({ client }: { client: Client }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white  dark:bg-surface-container-high p-3">
          <p className="text-xs text-on-surface-variant/80">Total Spent</p>
          <p className="text-lg font-semibold text-on-surface">{formatTSh(client.totalSpent)}</p>
        </div>
        <div className="rounded-lg bg-white  dark:bg-surface-container-high p-3">
          <p className="text-xs text-on-surface-variant/80">Last Contact</p>
          <p className="text-lg font-semibold text-on-surface">
            {client.lastProjectDate ? formatRelativeDate(new Date(client.lastProjectDate)) : "Never"}
          </p>
        </div>
        <div className="rounded-lg bg-white  dark:bg-surface-container-high p-3">
          <p className="text-xs text-on-surface-variant/80">Status</p>
          <Badge variant={statusBadge(client.status)}>{client.status}</Badge>
        </div>
      </div>

      {client.servicesUsed.length > 0 && (
        <div>
          <p className="text-xs text-on-surface-variant/80 mb-1">Services Used</p>
          <div className="flex flex-wrap gap-1.5">
            {client.servicesUsed.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {client.notes && (
        <div>
          <p className="text-xs text-on-surface-variant/80 mb-1">Notes</p>
          <p className="text-sm text-on-surface-variant">{client.notes}</p>
        </div>
      )}
    </div>
  )
}

function ProjectsTab({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-2">
      {projects.length === 0 ? (
        <p className="text-sm text-on-surface-variant/80">No projects yet.</p>
      ) : (
        projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg bg-white  dark:bg-surface-container-high p-3"
          >
            <div>
              <p className="text-sm font-medium text-on-surface">{p.serviceType}</p>
              <p className="text-xs text-on-surface-variant/80">
                {formatTSh(p.quotedAmount)} · {formatRelativeDate(new Date(p.createdAt))}
              </p>
            </div>
            <Badge variant={statusBadge(p.status)}>{p.status}</Badge>
          </div>
        ))
      )}
    </div>
  )
}

function PaymentsTab({ payments }: { payments: Payment[] }) {
  return (
    <div className="space-y-2">
      {payments.length === 0 ? (
        <p className="text-sm text-on-surface-variant/80">No payments yet.</p>
      ) : (
        payments.map((pay) => (
          <div
            key={pay.id}
            className="flex items-center justify-between rounded-lg bg-white  dark:bg-surface-container-high p-3"
          >
            <div>
              <p className="text-sm font-medium text-on-surface">{formatTSh(pay.amount)}</p>
              <p className="text-xs text-on-surface-variant/80">
                {pay.method} · {pay.paidAt ? formatRelativeDate(new Date(pay.paidAt)) : "Pending"}
              </p>
            </div>
            <Badge variant={statusBadge(pay.status)}>{pay.status}</Badge>
          </div>
        ))
      )}
    </div>
  )
}

function TimelineTab({ client, projects, payments }: { client: Client; projects: Project[]; payments: Payment[] }) {
  const items: { date: string; text: string; icon: ReactNode }[] = [
    ...projects.map((p) => ({
      date: p.createdAt,
      text: `Project "${p.serviceType}" created — ${formatTSh(p.quotedAmount)}`,
      icon: <ClipboardList className="w-5 h-5" />,
    })),
    ...payments.map((p) => ({
      date: p.paidAt || p.createdAt,
      text: `Payment ${formatTSh(p.amount)} received via ${p.method}`,
      icon: <DollarSign className="w-5 h-5" />,
    })),
    {
      date: client.createdAt,
      text: "Client created",
      icon: <User className="w-5 h-5" />,
    },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">{item.icon}</span>
          <div>
            <p className="text-sm text-on-surface-variant">{item.text}</p>
            <p className="text-xs text-on-surface-variant/80">{formatRelativeDate(new Date(item.date))}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ClientDetailModal({
  clientId,
  onClose,
}: {
  clientId: string
  onClose: () => void
}) {
  const { data: clientsData } = useClients()
  const { data: projectsData } = useProjects()
  const { data: paymentsData } = usePayments()
  const clients = ((clientsData as any)?.items ?? []) as Client[]
  const allProjects = ((projectsData as any)?.items ?? []) as Project[]
  const allPayments = ((paymentsData as any)?.items ?? []) as Payment[]

  const client = useMemo(() => clients.find((c) => c.id === clientId), [clients, clientId])
  const projects = useMemo(() => allProjects.filter((p) => p.clientId === clientId), [allProjects, clientId])
  const payments = useMemo(() => allPayments.filter((p) => p.clientId === clientId), [allPayments, clientId])

  const [tab, setTab] = useState("overview")

  if (!client) return null

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "projects", label: "Projects" },
    { key: "payments", label: "Payments" },
    { key: "timeline", label: "Timeline" },
  ]

  return (
    <Dialog open onClose={onClose} title={client.name}>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant={statusBadge(client.status)}>{client.status}</Badge>
        <span className="text-sm text-on-surface-variant/80">{maskPhone(client.whatsappNumber)}</span>
        {client.businessType && (
          <span className="text-sm text-on-surface-variant/80">| {client.businessType}</span>
        )}
        {client.location && (
          <span className="text-sm text-on-surface-variant/80">| {client.location}</span>
        )}
      </div>

      <div className="flex gap-1 border-b border-outline-variant mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant/80 hover:text-on-surface-variant"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab client={client} />}
      {tab === "projects" && <ProjectsTab projects={projects} />}
      {tab === "payments" && <PaymentsTab payments={payments} />}
      {tab === "timeline" && <TimelineTab client={client} projects={projects} payments={payments} />}

      <div className="flex gap-2 mt-6 pt-4 border-t border-outline-variant">
        <Button size="sm">
          <MessageSquare className="w-4 h-4 mr-1.5" />
          Send WhatsApp
        </Button>
        <Button variant="secondary" size="sm">
          Edit
        </Button>
      </div>
    </Dialog>
  )
}

