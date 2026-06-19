"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { formatTSh } from "@/lib/utils"
import {
  LogOut, Package, Calendar, DollarSign,
  MessageSquare, Clock, CheckCircle2,
  AlertCircle, Bot,
} from "lucide-react"

interface PortalProject {
  id: string
  serviceType: string
  description: string | null
  quotedAmount: number
  status: string
  createdAt: string
  quotedAt: string | null
  startedAt: string | null
  finalDeliveredAt: string | null
}

interface PortalPayment {
  id: string
  amount: number
  method: string
  status: string
  mpesaReference: string | null
  paidAt: string | null
  createdAt: string
}

interface PortalMessage {
  id: string
  direction: string
  channel: string
  content: string
  createdAt: string
}

interface PortalRetainer {
  id: string
  package: string
  monthlyValue: number
  graphicsDue: number
  graphicsDelivered: number
  nextPaymentDate: string | null
  status: string
}

interface PortalData {
  id: string
  name: string
  email: string | null
  businessType: string | null
  location: string | null
  status: string
  totalSpent: number
  projects: PortalProject[]
  payments: PortalPayment[]
  messages: PortalMessage[]
  retainers: PortalRetainer[]
}

function StatusBadgePortal({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    RETAINER: "bg-yellow-500/10 text-amber-700 border-yellow-500/20",
    DORMANT: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    CHURNED: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    NEW_INQUIRY: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    QUOTED: "bg-yellow-500/10 text-amber-700 border-yellow-500/20",
    DEPOSIT_PAID: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    IN_PROGRESS: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    REVISION: "bg-yellow-500/10 text-amber-700 border-yellow-500/20",
    FINAL_DELIVERED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    PAID: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    PAUSED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    paused: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    cancelled: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${styles[status] || "bg-gray-500/10 text-gray-600 border-gray-500/20"}`}>
      {status.replace(/_/g, " ")}
    </span>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer ${className ?? ""}`} />
  )
}

function LoadingState() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
        <SkeletonBlock className="h-9 w-24 rounded-lg" />
      </div>
      <div>
        <SkeletonBlock className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-outline-variant/30 bg-white/70 p-5 space-y-3">
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-3/4" />
              <div className="flex justify-between pt-2">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SkeletonBlock className="h-6 w-40 mb-4" />
        <div className="rounded-2xl border border-outline-variant/30 bg-white/70 p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="w-14 h-14 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-error" />
        </div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">Something went wrong</h3>
        <p className="text-sm text-on-surface-variant/70 mb-6">{message}</p>
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: PortalProject }) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-white/75 backdrop-blur-sm p-5 space-y-3 card-hover hover:bg-white/90">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-on-surface">{project.serviceType}</h4>
          {project.description && (
            <p className="text-xs text-on-surface-variant/70 mt-1 line-clamp-2">{project.description}</p>
          )}
        </div>
        <StatusBadgePortal status={project.status} />
      </div>
      <div className="flex items-center gap-4 text-xs text-on-surface-variant/70 pt-2 border-t border-outline-variant/20">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          {formatTSh(project.quotedAmount)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {format(new Date(project.createdAt), "MMM d, yyyy")}
        </span>
        {project.finalDeliveredAt && (
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {format(new Date(project.finalDeliveredAt), "MMM d, yyyy")}
          </span>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: PortalMessage }) {
  const isInbound = message.direction === "inbound"
  return (
    <div className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[80%] ${isInbound ? "bg-white border border-outline-variant/20" : "bg-primary/10"} rounded-2xl px-4 py-2.5`}>
        <p className="text-sm text-on-surface whitespace-pre-wrap">{message.content}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-on-surface-variant/70">
            {format(new Date(message.createdAt), "MMM d, h:mm a")}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${message.channel === "whatsapp" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"}`}>
            {message.channel}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PortalDashboardPage() {
  const router = useRouter()
  const params = useParams()
  const clientIdFromUrl = params.clientId as string

  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedId = sessionStorage.getItem("clientId")

    if (!storedId || storedId !== clientIdFromUrl) {
      sessionStorage.removeItem("clientId")
      router.replace("/portal/login")
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/v1/portal/${clientIdFromUrl}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error("Client not found")
          throw new Error("Failed to load data")
        }
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [clientIdFromUrl, router])

  const handleSignOut = () => {
    sessionStorage.removeItem("clientId")
    router.push("/portal/login")
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!data) return <ErrorState message="No data available" />

  const activeProjects = data.projects.filter((p) =>
    !["PAID", "FINAL_DELIVERED"].includes(p.status)
  )
  const recentMessages = data.messages.slice(0, 10).reverse()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: "var(--font-heading)" }}>
              {data.name}
            </h1>
            <StatusBadgePortal status={data.status} />
          </div>
          <p className="text-sm text-on-surface-variant/70 mt-1">Client Portal</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 bg-white/70 text-sm font-medium text-on-surface-variant hover:bg-white hover:text-error transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <a
          href={`/portal/${clientIdFromUrl}/agent`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Ask AI Assistant</span>
        </a>
      </div>

      {/* Client Info Bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant/70 bg-white/50 rounded-2xl border border-outline-variant/30 px-5 py-3">
        {data.email && (
          <span className="flex items-center gap-1.5">
            <span className="text-on-surface-variant/70">Email:</span> {data.email}
          </span>
        )}
        {data.businessType && (
          <span className="flex items-center gap-1.5">
            <span className="text-on-surface-variant/70">Business:</span> {data.businessType}
          </span>
        )}
        {data.location && (
          <span className="flex items-center gap-1.5">
            <span className="text-on-surface-variant/70">Location:</span> {data.location}
          </span>
        )}
        <span className="flex items-center gap-1.5 ml-auto">
          <span className="text-on-surface-variant/70">Total Spent:</span>
          <span className="font-semibold text-on-surface" style={{ fontFamily: "var(--font-mono)" }}>
            {formatTSh(data.totalSpent)}
          </span>
        </span>
      </div>

      {/* Active Projects */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-on-surface" style={{ fontFamily: "var(--font-heading)" }}>
            Active Projects
          </h2>
          <span className="text-xs text-on-surface-variant/70 bg-surface-container-highest/50 px-2 py-0.5 rounded-full">
            {activeProjects.length}
          </span>
        </div>
        {activeProjects.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/30 bg-white/50 p-8 text-center">
            <p className="text-sm text-on-surface-variant/80">No active projects at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Retainers */}
      {data.retainers.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-tertiary" />
            <h2 className="text-lg font-semibold text-on-surface" style={{ fontFamily: "var(--font-heading)" }}>
              Retainers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.retainers.map((retainer) => (
              <div key={retainer.id} className="rounded-2xl border border-outline-variant/30 bg-white/75 backdrop-blur-sm p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-on-surface">{retainer.package.replace(/_/g, " ")}</h4>
                  <StatusBadgePortal status={retainer.status} />
                </div>
                <p className="text-xl font-bold text-on-surface" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatTSh(retainer.monthlyValue)}
                  <span className="text-xs font-normal text-on-surface-variant/80"> /mo</span>
                </p>
                <div className="flex items-center justify-between text-xs text-on-surface-variant/70">
                  <span>Graphics: {retainer.graphicsDelivered}/{retainer.graphicsDue}</span>
                  {retainer.nextPaymentDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Next: {format(new Date(retainer.nextPaymentDate), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Payment History */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-on-surface" style={{ fontFamily: "var(--font-heading)" }}>
            Payment History
          </h2>
        </div>
        {data.payments.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/30 bg-white/50 p-8 text-center">
            <p className="text-sm text-on-surface-variant/80">No payment records yet</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/30 bg-white/75 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">Method</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-5 py-3 text-on-surface-variant whitespace-nowrap">
                        {format(new Date(payment.paidAt || payment.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-5 py-3 font-semibold text-on-surface" style={{ fontFamily: "var(--font-mono)" }}>
                        {formatTSh(payment.amount)}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">{payment.method}</td>
                      <td className="px-5 py-3">
                        <StatusBadgePortal status={payment.status} />
                      </td>
                      <td className="px-5 py-3 text-xs font-mono text-on-surface-variant/80">
                        {payment.mpesaReference || "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Recent Messages */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-[#00629f]" />
          <h2 className="text-lg font-semibold text-on-surface" style={{ fontFamily: "var(--font-heading)" }}>
            Recent Messages
          </h2>
        </div>
        {recentMessages.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/30 bg-white/50 p-8 text-center">
            <p className="text-sm text-on-surface-variant/80">No messages yet</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/30 backdrop-blur-sm p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {recentMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-xs text-on-surface-variant/70">
          LUMARY Studio &copy; {new Date().getFullYear()} &mdash; Client Portal
        </p>
      </div>
    </div>
  )
}
