import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer",
        className
      )}
      {...props}
    />
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50 p-5 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

const CHART_BARS = [52.2, 63.0, 50.1, 72.5, 57.1, 70.9]

export function ChartSkeleton() {
  return (
    <div className="flex items-end gap-2 h-48">
      {CHART_BARS.map((h, i) => (
        <Skeleton
          key={i}
          className="flex-1"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}
