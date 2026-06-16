import { cn } from "@/lib/utils"

type BadgeVariant =
  | "active" | "retainer" | "dormant" | "churned"
  | "paid" | "unpaid" | "in_progress" | "rush"
  | "pending" | "overdue" | "default" | "info"

const badgeStyles: Record<BadgeVariant, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/20",
  retainer: "bg-yellow-500/10 text-amber-700 border-yellow-500/20 dark:bg-yellow-400/15 dark:text-yellow-300 dark:border-yellow-400/20",
  dormant: "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-400/15 dark:text-gray-300 dark:border-gray-400/20",
  churned: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-400/15 dark:text-rose-300 dark:border-rose-400/20",
  paid: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/20",
  unpaid: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-400/15 dark:text-rose-300 dark:border-rose-400/20",
  in_progress: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:bg-orange-400/15 dark:text-orange-300 dark:border-orange-400/20",
  rush: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-400/15 dark:text-rose-300 dark:border-rose-400/20",
  pending: "bg-yellow-500/10 text-amber-700 border-yellow-500/20 dark:bg-yellow-400/15 dark:text-yellow-300 dark:border-yellow-400/20",
  overdue: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-400/15 dark:text-rose-300 dark:border-rose-400/20",
  default: "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-400/15 dark:text-gray-300 dark:border-gray-400/20",
  info: "bg-secondary/10 text-secondary border-secondary/20",
}

export function Badge({
  variant = "default",
  children,
  className,
}: {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        badgeStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function statusBadge(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    ACTIVE: "active",
    RETAINER: "retainer",
    DORMANT: "dormant",
    CHURNED: "churned",
    PAID: "paid",
    UNPAID: "unpaid",
    FIFTY_PERCENT: "pending",
    OVERDUE: "overdue",
    REFUNDED: "default",
    IN_PROGRESS: "in_progress",
    NEW_INQUIRY: "default",
    QUOTED: "pending",
    DEPOSIT_PAID: "info",
    REVISION: "pending",
    FINAL_DELIVERED: "active",
    RETAINER_PITCH: "retainer",
  }
  return map[status] || "default"
}
