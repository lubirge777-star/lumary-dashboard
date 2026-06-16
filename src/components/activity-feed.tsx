"use client"

import { useMemo } from "react"
import { useActivities } from "@/lib/api-hooks"
import { formatRelativeDate } from "@/lib/utils"
import { Activity } from "@/types"
import { Clock, CheckCircle, UserPlus, DollarSign, TrendingUp, MessageSquare, RefreshCw, FileText, ClipboardList } from "lucide-react"

const activityIcons: Record<string, React.ReactNode> = {
  PAYMENT_RECEIVED: <DollarSign className="w-5 h-5" />,
  CLIENT_CREATED: <UserPlus className="w-5 h-5" />,
  PROJECT_CREATED: <FileText className="w-5 h-5" />,
  PROJECT_STATUS_CHANGED: <TrendingUp className="w-5 h-5" />,
  RETAINER_CREATED: <RefreshCw className="w-5 h-5" />,
  RETAINER_RENEWED: <RefreshCw className="w-5 h-5" />,
  MESSAGE_SENT: <MessageSquare className="w-5 h-5" />,
  MESSAGE_RECEIVED: <MessageSquare className="w-5 h-5" />,
  EXPENSE_LOGGED: <ClipboardList className="w-5 h-5" />,
  FILE_UPLOADED: <FileText className="w-5 h-5" />,
  NOTE_ADDED: <ClipboardList className="w-5 h-5" />,
}

const activityColors: Record<string, string> = {
  PAYMENT_RECEIVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  CLIENT_CREATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  PROJECT_CREATED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  PROJECT_STATUS_CHANGED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  RETAINER_CREATED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  RETAINER_RENEWED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  MESSAGE_SENT: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  MESSAGE_RECEIVED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  EXPENSE_LOGGED: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  FILE_UPLOADED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  NOTE_ADDED: "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300",
}

export function ActivityFeed() {
  const { data: activitiesData } = useActivities()
  const activities = (activitiesData as any)?.items ?? []

  const items: Activity[] = useMemo(() => {
    return activities.slice(0, 8)
  }, [activities])

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-on-surface-variant/80" />
          </div>
          <p className="text-sm text-on-surface-variant/70">No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center gap-5 p-4 hover:bg-surface-container-high/50 dark:hover:bg-surface-container-high/50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-outline-variant/40 dark:hover:border-white/10"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activityColors[activity.type] || "bg-surface-variant text-on-surface-variant"}`}>
            {activityIcons[activity.type] || <Clock className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-on-surface truncate">{activity.description}</p>
            <p className="text-sm text-on-surface-variant mt-0.5 truncate">
              {activity.targetType} &middot; {activity.actorName || "System"}
            </p>
          </div>
          <span className="text-xs font-bold text-on-surface-variant/70 whitespace-nowrap">
            {formatRelativeDate(new Date(activity.createdAt))}
          </span>
        </div>
      ))}
    </div>
  )
}
