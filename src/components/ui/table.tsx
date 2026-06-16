"use client"

import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { useState } from "react"

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render: (item: T) => React.ReactNode
}

export function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  pageSize = 20,
}: {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  pageSize?: number
}) {
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const totalPages = Math.ceil(data.length / pageSize)

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = (a as any)[sortKey]
    const bVal = (b as any)[sortKey]
    if (aVal == null) return 1
    if (bVal == null) return -1
    return sortDir === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1
  })

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  return (
    <div className="rounded-2xl border border-outline-variant/30 dark:border-white/5 bg-white/50 dark:bg-surface-container/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-variant/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3.5 text-left text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest",
                    col.sortable && "cursor-pointer hover:text-on-surface select-none transition-colors"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <ArrowUpDown className={cn(
                        "w-3 h-3 transition-colors",
                        sortKey === col.key ? "text-primary" : "text-outline-variant"
                      )} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {paged.map((item, i) => (
              <tr
                key={item.id}
                className={cn(
                  "transition-all duration-150",
                  "hover:bg-primary/5 hover:shadow-[inset_0_1px_0_rgba(157,67,25,0.05)]",
                  onRowClick && "cursor-pointer",
                  "animate-fadeInUp",
                )}
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-on-surface-variant">
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-on-surface-variant/80">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/30 bg-surface-variant/20">
          <span className="text-xs text-on-surface-variant/80">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
            </button>
            <span className="text-xs text-on-surface-variant/80 min-w-[4ch] text-center">
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
