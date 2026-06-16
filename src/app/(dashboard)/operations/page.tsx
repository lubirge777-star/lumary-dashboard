"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { formatTSh } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import {
  Sun, Moon, BookOpen, Code, MessageSquare, Palette, Brain,
  NotebookPen, PenSquare, TrendingUp, Briefcase, AlertCircle, Clock,
  DollarSign, ClipboardList, Target, RefreshCw, Check, Loader2,
} from "lucide-react"

const schedule = [
  { time: "05:00", icon: Sun, label: "Fajr, Quran 1 page, day review, set 3 priorities", duration: "30 min", color: "bg-amber-100 text-amber-700" },
  { time: "06:00", icon: BookOpen, label: "English shadowing session", duration: "30 min", color: "bg-sky-100 text-sky-700" },
  { time: "08:00", icon: Code, label: "PRIMARY CODING BLOCK — protected, no interruption", duration: "90 min", color: "bg-primary/10 text-primary", sacred: true },
  { time: "Throughout", icon: MessageSquare, label: "Client WhatsApp messages (check 3x/day)", duration: "--", color: "bg-emerald-100 text-emerald-700" },
  { time: "After classes", icon: Palette, label: "Design work for active client projects", duration: "--", color: "bg-purple-100 text-purple-700" },
  { time: "Evening", icon: Brain, label: "Malewicz video, AI tools 10 min, reading 20 min", duration: "45 min", color: "bg-indigo-100 text-indigo-700" },
  { time: "21:00", icon: NotebookPen, label: "Journal entry", duration: "10 min", color: "bg-rose-100 text-rose-700" },
]

const weeklyChecklistItems = [
  { id: "income-log", label: "Update income log" },
  { id: "invoices-followup", label: "Follow up on outstanding invoices" },
  { id: "retainer-deliverables", label: "Review retainer client deliverables" },
  { id: "portfolio-post", label: "Post best work to Behance/WhatsApp" },
  { id: "roadmap-check", label: "Check roadmap progress" },
]

const monthlyReviewCards = [
  { title: "Financial Review", icon: DollarSign, gradient: "grad-orange", description: "Review income, expenses, and profit for the month." },
  { title: "Business Review", icon: Briefcase, gradient: "grad-blue", description: "Assess client satisfaction, project delivery, and bottlenecks." },
  { title: "Learning Review", icon: BookOpen, gradient: "grad-purple", description: "What skills were gained? What to learn next month?" },
  { title: "Next Month Goals", icon: Target, gradient: "grad-green", description: "Set revenue targets, project goals, and personal milestones." },
]

export default function OperationsPage() {
  useEffect(() => { document.title = "Operations — LUMARY Studio" }, [])
  const { toast } = useToast()

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const stored = localStorage.getItem("lumary-weekly-checklist")
    if (stored) {
      try { setCheckedItems(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem("lumary-weekly-checklist", JSON.stringify(next))
      if (next[id]) {
        toast("success", "Task Completed", `${weeklyChecklistItems.find(i => i.id === id)?.label || id} done`)
      }
      return next
    })
  }

  const { data: incomeData, isLoading: incomeLoading, error: incomeError } = useQuery({
    queryKey: ["operations-income"],
    queryFn: () => fetch("/api/v1/finance/income").then((r) => r.json()),
  })

  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ["operations-projects"],
    queryFn: () => fetch("/api/v1/projects").then((r) => r.json()),
  })

  const { data: invoicesData, isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: ["operations-invoices"],
    queryFn: () => fetch("/api/v1/payments?status=UNPAID").then((r) => r.json()),
  })

  const incomeTotal = typeof incomeData === "number" ? incomeData : (incomeData as any)?.total ?? 0
  const activeProjects = Array.isArray(projectsData)
    ? projectsData.filter((p: any) => !["FINAL_DELIVERED", "PAID"].includes(p.status)).length
    : ((projectsData as any)?.items ?? []).filter((p: any) => !["FINAL_DELIVERED", "PAID"].includes(p.status)).length
  const pendingInvoices = Array.isArray(invoicesData)
    ? invoicesData.length
    : ((invoicesData as any)?.items ?? []).length

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-on-surface">Operations</h1>
        <p className="text-sm text-on-surface-variant/80 mt-1">Weekly operating routine &amp; business admin tools</p>
      </div>

      {/* Daily Schedule */}
      <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6">
        <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Daily Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4 w-28">Time</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4">Activity</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => {
                const Icon = item.icon
                return (
                  <tr
                    key={item.time}
                    className={cn(
                      "border-b border-outline-variant/10 transition-all hover:bg-black/[0.02]",
                      item.sacred && "bg-primary/5"
                    )}
                  >
                    <td className="py-3.5 pr-4 align-top">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={cn("font-mono text-sm font-semibold", item.sacred ? "text-primary" : "text-on-surface")}>
                          {item.time}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      {item.sacred ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                          <Code className="w-4 h-4" />
                          {item.label}
                        </span>
                      ) : (
                        <span className="text-on-surface">{item.label}</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right align-top">
                      <span className={cn(
                        "inline-block text-xs font-semibold px-2.5 py-1 rounded-lg",
                        item.sacred
                          ? "bg-primary/10 text-primary"
                          : "bg-outline-variant/30 text-on-surface-variant/70"
                      )}>
                        {item.duration}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Admin Checklist + Monthly Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Admin Checklist */}
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-2 flex items-center gap-2">
            <PenSquare className="w-4 h-4 text-primary" />
            Weekly Admin Checklist
          </h3>
          <p className="text-xs text-on-surface-variant/80 mb-5">Friday routine — close the week right</p>
          <div className="space-y-2">
            {weeklyChecklistItems.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left",
                  checkedItems[item.id]
                    ? "bg-primary/5 border-primary/20"
                    : "bg-white/40 dark:bg-surface-container/40 border-outline-variant/20 hover:border-primary/10"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                  checkedItems[item.id]
                    ? "bg-primary border-primary"
                    : "border-outline-variant/40"
                )}>
                  {checkedItems[item.id] && <Check className="w-3.5 h-3.5 text-on-primary" />}
                </div>
                <span className={cn(
                  "text-sm transition-all",
                  checkedItems[item.id] ? "text-on-surface-variant/80 line-through" : "text-on-surface"
                )}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Review */}
        <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-5 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Monthly Review
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {monthlyReviewCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="relative overflow-hidden p-4 rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/20 dark:border-white/5 group hover:shadow-md transition-all cursor-pointer"
                >
                  <div className={cn(
                    "absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 blur-2xl group-hover:opacity-30 transition-opacity",
                    card.gradient
                  )} />
                  <div className="relative z-10">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center mb-3",
                      card.gradient === "grad-orange" && "bg-primary/10 text-primary",
                      card.gradient === "grad-blue" && "bg-secondary/10 text-secondary",
                      card.gradient === "grad-purple" && "bg-tertiary/10 text-tertiary",
                      card.gradient === "grad-green" && "bg-emerald-500/10 text-emerald-600"
                    )}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="text-sm font-semibold text-on-surface mb-1">{card.title}</h4>
                    <p className="text-xs text-on-surface-variant/80 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Business Admin Tools */}
      <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-6">
        <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Business Admin Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminCard
            icon={DollarSign}
            label="Total Income This Month"
            loading={incomeLoading}
            error={!!incomeError}
            value={typeof incomeTotal === "number" ? formatTSh(incomeTotal) : "TSh 0"}
            gradient="grad-orange"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <AdminCard
            icon={Briefcase}
            label="Active Projects"
            loading={projectsLoading}
            error={!!projectsError}
            value={typeof activeProjects === "number" ? activeProjects.toString() : "0"}
            gradient="grad-blue"
            iconBg="bg-secondary/10"
            iconColor="text-secondary"
          />
          <AdminCard
            icon={AlertCircle}
            label="Pending Invoices"
            loading={invoicesLoading}
            error={!!invoicesError}
            value={typeof pendingInvoices === "number" ? pendingInvoices.toString() : "0"}
            gradient="grad-purple"
            iconBg="bg-tertiary/10"
            iconColor="text-tertiary"
          />
        </div>
      </div>
    </div>
  )
}

function AdminCard({
  icon: Icon,
  label,
  value,
  loading,
  error,
  gradient,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType
  label: string
  value: string
  loading: boolean
  error: boolean
  gradient: string
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="relative overflow-hidden p-5 rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/20 dark:border-white/5 group hover:shadow-md transition-all">
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-30 transition-opacity", gradient)} />
      <div className="relative z-10 space-y-3">
        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center", iconBg, iconColor)}>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : error ? (
            <RefreshCw className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        <p className="text-label-sm text-on-surface-variant opacity-70">{label}</p>
        <p className="text-headline-sm font-bold text-on-surface">
          {loading ? (
            <span className="inline-block w-16 h-6 rounded-md bg-outline-variant/30 animate-pulse" />
          ) : error ? (
            <span className="text-error text-sm font-medium">Failed to load</span>
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  )
}
