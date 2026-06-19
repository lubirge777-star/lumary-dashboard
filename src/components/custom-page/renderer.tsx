/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface Block {
  type: "kpi" | "chart" | "list" | "markdown" | "table"
  title: string
  dataSource?: string      // API route to fetch data from
  query?: string           // Optional query string
  field?: string            // For KPIs, which field to display
  labelField?: string       // For lists/tables, the label field
  valueField?: string       // For lists/tables, the value field
  content?: string          // For markdown blocks
  columns?: { key: string; label: string }[]  // For table blocks
  chartType?: "bar" | "line" | "pie"
}

interface PageConfig {
  title: string
  layout: "grid" | "list"
  blocks: Block[]
}

function BlockRenderer({ block }: { block: Block }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["custom-block", block.title, block.dataSource],
    queryFn: () => fetch(block.dataSource || "").then((r) => r.json()),
    enabled: !!block.dataSource,
  })

  if (block.type === "markdown" && block.content) {
    return (
      <div className="glass-card p-card-padding">
        <h3 className="text-sm font-bold text-on-surface mb-3">{block.title}</h3>
        <div className="text-sm text-on-surface-variant/80 leading-relaxed whitespace-pre-wrap">
          {block.content}
        </div>
      </div>
    )
  }

  if (block.dataSource && isLoading) {
    return (
      <div className="glass-card p-card-padding flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }

  if (block.dataSource && error) {
    return (
      <div className="glass-card p-card-padding flex items-center justify-center h-32 text-xs text-error">
        <button onClick={() => refetch()} className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Retry</button>
      </div>
    )
  }

  const items = Array.isArray(data) ? data : data?.items ?? []

  if (block.type === "kpi") {
    const value = block.field ? items[0]?.[block.field] : items.length
    return (
      <div className="glass-card p-card-padding flex flex-col relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 grad-orange rounded-full opacity-10 blur-2xl" />
        <p className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider mb-2">{block.title}</p>
        <p className="text-3xl font-bold text-on-surface">{typeof value === "number" && value > 1000 ? value.toLocaleString() : String(value ?? "—")}</p>
      </div>
    )
  }

  if (block.type === "chart") {
    return (
      <div className="glass-card p-card-padding">
        <h3 className="text-sm font-bold text-on-surface mb-4">{block.title}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={items}>
            <XAxis dataKey={block.labelField || "name"} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={block.valueField || "value"} fill="var(--color-primary, #9d4319)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (block.type === "list") {
    return (
      <div className="glass-card p-card-padding">
        <h3 className="text-sm font-bold text-on-surface mb-3">{block.title}</h3>
        <div className="space-y-2">
          {items.slice(0, 10).map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-variant/20">
              <span className="text-sm text-on-surface">{block.labelField ? item[block.labelField] : item.name || item.label || item.title}</span>
              <span className="text-xs font-semibold text-on-surface-variant/80">{block.valueField ? item[block.valueField] : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (block.type === "table" && block.columns) {
    return (
      <div className="glass-card p-card-padding overflow-x-auto">
        <h3 className="text-sm font-bold text-on-surface mb-3">{block.title}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20">
              {block.columns.map((col) => (
                <th key={col.key} className="text-left px-3 py-2 text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-variant/10">
                {block.columns!.map((col) => (
                  <td key={col.key} className="px-3 py-2 text-on-surface-variant">{String(item[col.key] ?? "—")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}

interface PageRendererProps {
  config: PageConfig
}

export default function PageRenderer({ config }: PageRendererProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-heading font-bold text-on-surface">{config.title}</h1>

      <div className={config.layout === "grid"
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
      }>
        {config.blocks.map((block, idx) => (
          <div key={idx} className={config.layout === "grid" || block.type === "kpi" ? "" : ""}>
            <BlockRenderer block={block} />
          </div>
        ))}
      </div>
    </div>
  )
}
