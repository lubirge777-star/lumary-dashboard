"use client"

import { useRouter } from "next/navigation"
import { UserPlus, Briefcase, Send, FileText, TrendingUp, Calendar } from "lucide-react"

const actions = [
  { label: "New Client", icon: UserPlus, href: "/clients?add=true", color: "bg-primary/12 text-primary dark:bg-primary/20" },
  { label: "New Project", icon: Briefcase, href: "/projects?add=true", color: "bg-secondary/12 text-secondary dark:bg-secondary/20" },
  { label: "Send Message", icon: Send, href: "/messages", color: "bg-tertiary/12 text-tertiary dark:bg-tertiary/20" },
  { label: "Create Invoice", icon: FileText, href: "/finance?invoice=true", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { label: "View Analytics", icon: TrendingUp, href: "/analytics", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  { label: "Schedule", icon: Calendar, href: "/projects", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {actions.map((a) => {
        const Icon = a.icon
        return (
          <button
            key={a.label}
            onClick={() => router.push(a.href)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/60 dark:bg-surface-container-high/80 border border-outline-variant/20 dark:border-outline-variant/10 hover:border-primary/20 hover:bg-white dark:hover:bg-surface-container-high active:scale-[0.97] transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-on-surface-variant/70 text-center leading-tight">
              {a.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
