"use client"

import { useState, useMemo, useDeferredValue } from "react"
import { useClients } from "@/lib/api-hooks"
import { FilterBar } from "@/components/ui/filters"
import { Table } from "@/components/ui/table"
import { Badge, statusBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatTSh, maskPhone } from "@/lib/utils"
import type { Client } from "@/types"
import { ClientDetailModal } from "./client-detail-modal"
import { AddClientForm } from "./add-client-form"
import { Dialog } from "@/components/ui/dialog"
import { Plus, AlertCircle, Search, X } from "lucide-react"
import { TableSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

export function ClientsPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string | null>(null)
  const deferredSearch = useDeferredValue(search)
  const params = useMemo(() => {
    const p: Record<string, string> = {}
    if (deferredSearch) p.search = deferredSearch
    if (filter) p.status = filter
    return p
  }, [deferredSearch, filter])
  const { data, isLoading, error, refetch } = useClients(params)
  const clients: Client[] = data?.items ?? []
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const filters = [
    { label: "All", value: null },
    { label: "Active", value: "ACTIVE" },
    { label: "Retainer", value: "RETAINER" },
    { label: "Dormant", value: "DORMANT" },
    { label: "Churned", value: "CHURNED" },
  ]

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (c: Client) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
            {c.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface">{c.name}</p>
            <p className="text-xs text-on-surface-variant/70">{c.businessType || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "whatsappNumber",
      label: "WhatsApp",
      render: (c: Client) => (
        <span className="text-sm text-on-surface-variant font-mono">{maskPhone(c.whatsappNumber)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (c: Client) => <Badge variant={statusBadge(c.status)}>{c.status}</Badge>,
    },
    {
      key: "totalSpent",
      label: "Total Spent",
      sortable: true,
      render: (c: Client) => (
        <span className="text-sm text-on-surface font-mono font-semibold">{formatTSh(c.totalSpent)}</span>
      ),
    },
    {
      key: "referralSource",
      label: "Source",
      render: (c: Client) => (
        <span className="text-xs text-on-surface-variant/80">{c.referralSource || "—"}</span>
      ),
    },
  ]

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load clients</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Clients</h1>
          <p className="text-sm text-on-surface-variant/70 mt-1">
            {isLoading ? "Loading..." : `${clients.length} total`}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/80" />
          <input
            className="w-full bg-white border border-outline-variant rounded-xl pl-9 pr-8 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 hover:text-on-surface">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value ?? "all"}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filter === f.value
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-white text-on-surface-variant border border-outline-variant hover:border-primary/30 hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50 p-5">
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50">
          <EmptyState
            title="No clients found"
            description={search ? "Try a different search term" : "Add your first client to get started"}
            action={
              !search ? (
                <Button onClick={() => setShowAdd(true)}>
                  <Plus className="w-4 h-4" />
                  Add Client
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <Table
          columns={columns}
          data={clients}
          onRowClick={(c: Client) => setSelectedClient(c.id)}
        />
      )}

      {selectedClient && (
        <ClientDetailModal
          clientId={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Add New Client">
        <AddClientForm onClose={() => setShowAdd(false)} />
      </Dialog>
    </div>
  )
}
