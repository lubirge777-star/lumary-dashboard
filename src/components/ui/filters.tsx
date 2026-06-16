"use client"

import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

export function FilterBar({
  placeholder = "Search...",
  filters,
  onSearch,
  searchValue,
}: {
  placeholder?: string
  filters: {
    key: string
    label: string
    active?: boolean
    onClick: () => void
  }[]
  onSearch: (value: string) => void
  searchValue: string
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/80" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-white border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={f.onClick}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              f.active
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-transparent text-on-surface-variant border-outline-variant hover:border-primary/30 hover:text-primary"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
