"use client"

import { useState, useMemo, useDeferredValue } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRetainers, useCreateRetainer } from "@/lib/api-hooks"
import { Button } from "@/components/ui/button"
import { Badge, statusBadge } from "@/components/ui/badge"
import { Dialog } from "@/components/ui/dialog"
import { Input, Select } from "@/components/ui/input"
import { formatTSh } from "@/lib/utils"
import { CardSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import type { Retainer } from "@/types"
import { Search, X, AlertCircle } from "lucide-react"

function RetainerCard({ retainer, index }: { retainer: Retainer; index: number }) {
  const progress = retainer.graphicsDue > 0
    ? Math.round((retainer.graphicsDelivered / retainer.graphicsDue) * 100)
    : 0

  return (
    <div
      className="rounded-xl border border-outline-variant/50 bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-5 card-hover relative overflow-hidden animate-fadeInUp"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#d4a853]/5 to-transparent rounded-bl-full" />
      <div className="flex items-start justify-between mb-3 relative">
        <div>
          <h3 className="text-sm font-semibold text-on-surface">{retainer.clientName}</h3>
          <p className="text-xs text-on-surface-variant/80 mt-0.5 uppercase tracking-wide">
            {retainer.package.replace(/_/g, " ")}
          </p>
        </div>
        <Badge variant={retainer.paymentStatus === "paid" ? "paid" : retainer.paymentStatus === "overdue" ? "overdue" : "unpaid"}>
          {retainer.paymentStatus}
        </Badge>
      </div>

      <p className="text-2xl font-semibold text-on-surface font-mono mb-4">
        {formatTSh(retainer.monthlyValue)}
        <span className="text-xs text-on-surface-variant/80 font-sans font-normal">/mo</span>
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-on-surface-variant/80">Content Delivery</span>
          <span className="text-on-surface-variant font-mono">
            {retainer.graphicsDelivered}/{retainer.graphicsDue}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-fixed-dim transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/30">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${
            retainer.renewalDaysLeft <= 3
              ? "bg-rose-400 animate-pulse"
              : retainer.renewalDaysLeft <= 7
                ? "bg-[#ffa502]"
                : "bg-[#6b6b7b]"
          }`} />
          <span
            className={`text-xs font-medium ${
              retainer.renewalDaysLeft <= 3
                ? "text-error"
                : retainer.renewalDaysLeft <= 7
                  ? "text-[#ffa502]"
                  : "text-on-surface-variant/80"
            }`}
          >
            {retainer.renewalDaysLeft <= 0
              ? "Renewal overdue"
              : `${retainer.renewalDaysLeft} days remaining`}
          </span>
        </div>
        <button className="text-xs text-primary hover:text-[#b8922e] font-medium transition-colors">
          View Details →
        </button>
      </div>
    </div>
  )
}

const retainerSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  package: z.enum(["WHATSAPP_PACK", "SOCIAL_MEDIA_PACK", "WEEKLY_PROMO_PACK", "MONTHLY_STATUS_MARKETING", "CREATOR_MONTHLY", "BRAND_MANAGER", "CUSTOM"]),
  monthlyValue: z.number().min(1, "Value must be > 0"),
  graphicsDue: z.number().min(1, "At least 1 graphic due"),
})

type RetainerForm = z.infer<typeof retainerSchema>

const packageOptions = [
  { value: "WHATSAPP_PACK", label: "WhatsApp Pack" },
  { value: "SOCIAL_MEDIA_PACK", label: "Social Media Pack" },
  { value: "WEEKLY_PROMO_PACK", label: "Weekly Promo Pack" },
  { value: "MONTHLY_STATUS_MARKETING", label: "Monthly Status Marketing" },
  { value: "CREATOR_MONTHLY", label: "Creator Monthly" },
  { value: "BRAND_MANAGER", label: "Brand Manager" },
  { value: "CUSTOM", label: "Custom" },
]

function AddRetainerForm({ onClose }: { onClose: () => void }) {
  const createRetainer = useCreateRetainer()
  const { register, handleSubmit, control, formState: { errors } } = useForm<RetainerForm>({
    resolver: zodResolver(retainerSchema),
    defaultValues: { package: "SOCIAL_MEDIA_PACK", graphicsDue: 12 },
  })

  const onSubmit = (data: RetainerForm) => {
    createRetainer.mutate({
      clientName: data.clientName,
      clientId: `c${Date.now()}`,
      package: data.package,
      monthlyValue: data.monthlyValue,
      graphicsDue: data.graphicsDue,
      graphicsDelivered: 0,
      paymentStatus: "unpaid",
      status: "active",
      contentDueBy: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Client Name" error={errors.clientName?.message} {...register("clientName")} />
      <Controller
        name="package"
        control={control}
        render={({ field }) => (
          <Select label="Package" options={packageOptions} value={field.value} onChange={field.onChange} />
        )}
      />
      <Input label="Monthly Value (TSh)" type="number" error={errors.monthlyValue?.message} {...register("monthlyValue", { valueAsNumber: true })} />
      <Input label="Graphics Due Per Month" type="number" error={errors.graphicsDue?.message} {...register("graphicsDue", { valueAsNumber: true })} />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={createRetainer.isPending}>Create</Button>
      </div>
    </form>
  )
}

export function RetainersPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string | null>(null)
  const deferredSearch = useDeferredValue(search)
  const params = useMemo(() => {
    const p: Record<string, string> = {}
    if (deferredSearch) p.search = deferredSearch
    if (filter) p.status = filter
    return p
  }, [deferredSearch, filter])
  const retainersQuery = useRetainers(params)
  const retainers: Retainer[] = retainersQuery.data?.items ?? []
  const [showAdd, setShowAdd] = useState(false)

  const alerts = useMemo(() => {
    const paymentOverdue = retainers.filter((r) => r.paymentStatus === "overdue" || r.paymentStatus === "unpaid")
    const contentOverdue = retainers.filter((r) => r.graphicsDelivered < r.graphicsDue)
    const renewingSoon = retainers.filter((r) => r.renewalDaysLeft <= 7 && r.renewalDaysLeft > 0)
    return { paymentOverdue, contentOverdue, renewingSoon }
  }, [retainers])

  const hasAlerts = alerts.paymentOverdue.length > 0 || alerts.contentOverdue.length > 0 || alerts.renewingSoon.length > 0
  const isLoading = retainersQuery.isLoading
  const hasError = retainersQuery.error

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-on-surface mb-2">Failed to load retainers</h3>
          <p className="text-sm text-on-surface-variant/80 mb-6">Please try refreshing the page</p>
          <button onClick={() => retainersQuery.refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Retainers</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Manage recurring client engagements</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ New Retainer</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/80" />
          <input
            className="w-full bg-white border border-outline-variant rounded-xl pl-9 pr-8 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
            placeholder="Search retainers..."
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
          {[{ label: "All", value: null }, { label: "Active", value: "active" }, { label: "Paused", value: "paused" }, { label: "Cancelled", value: "cancelled" }].map((f) => (
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

      {hasAlerts && (
        <div className="rounded-xl border border-outline-variant/50 bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-5 space-y-2.5">
          <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider">Alerts</h3>
          {alerts.paymentOverdue.length > 0 && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-6 h-6 rounded-lg bg-error/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              </div>
              <span className="text-error">
                Payment overdue for {alerts.paymentOverdue.length} client{alerts.paymentOverdue.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {alerts.contentOverdue.length > 0 && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-6 h-6 rounded-lg bg-[#ffa502]/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffa502]" />
              </div>
              <span className="text-[#ffa502]">
                Content overdue: {alerts.contentOverdue.length} client{alerts.contentOverdue.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {alerts.renewingSoon.length > 0 && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-6 h-6 rounded-lg bg-[#ffa502]/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffa502]" />
              </div>
              <span className="text-[#ffa502]">
                {alerts.renewingSoon.length} retainer{alerts.renewingSoon.length > 1 ? "s" : ""} renewing in {Math.min(...alerts.renewingSoon.map((r) => r.renewalDaysLeft))} days
              </span>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : retainers.length === 0 ? (
        <EmptyState title="No retainers yet" description="Create your first retainer" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {retainers.map((r, i) => (
            <RetainerCard key={r.id} retainer={r} index={i} />
          ))}
        </div>
      )}

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="New Retainer">
        <AddRetainerForm onClose={() => setShowAdd(false)} />
      </Dialog>
    </div>
  )
}
