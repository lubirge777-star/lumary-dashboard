"use client"

import { useMemo } from "react"
import { usePayments, useProjects } from "@/lib/api-hooks"
import { formatTSh } from "@/lib/utils"
import type { Payment, Project } from "@/types"
import { Calendar, AlertCircle, DollarSign } from "lucide-react"

export function UpcomingWidget() {
  const { data: paymentsData } = usePayments()
  const { data: projectsData } = useProjects()
  const payments: Payment[] = paymentsData?.items ?? []
  const projects: Project[] = ((projectsData as any)?.items ?? []) as Project[]

  const upcomingPayments = useMemo(() => {
    return payments
      .filter((p) => p.status === "UNPAID" || p.status === "OVERDUE")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 5)
  }, [payments])

  const stalledProjects = useMemo(() => {
    return projects
      .filter((p) => p.status === "NEW_INQUIRY" || p.status === "QUOTED")
      .slice(0, 3)
  }, [projects])

  if (upcomingPayments.length === 0 && stalledProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-sm text-on-surface-variant/70">
        <Calendar className="w-8 h-8 mb-2 opacity-40" />
        No upcoming items
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {upcomingPayments.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-3 flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5" /> Unpaid Payments
          </h4>
          <div className="space-y-2">
            {upcomingPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-200/30 dark:bg-amber-900/15 dark:border-amber-800/20">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{p.clientName || p.clientId}</p>
                  <p className="text-xs text-on-surface-variant/80">
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300 font-mono shrink-0 ml-3">
                  {formatTSh(p.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stalledProjects.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" /> Stalled Projects
          </h4>
          <div className="space-y-2">
            {stalledProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-rose-50/50 border border-rose-200/30 dark:bg-rose-900/15 dark:border-rose-800/20">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{p.serviceType}</p>
                  <p className="text-xs text-on-surface-variant/80">
                    {p.clientName || p.clientId} · {p.status.replace("_", " ")}
                  </p>
                </div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-300 shrink-0 ml-3">
                  {formatTSh(p.quotedAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
