import type { ReactNode } from "react"
import { Inbox } from "lucide-react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5">
        {icon || <Inbox className="w-7 h-7 text-on-surface-variant/80" />}
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1.5">{title}</h3>
      {description && <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6 leading-relaxed">{description}</p>}
      {action && <div className="animate-fadeInUp">{action}</div>}
    </div>
  )
}
