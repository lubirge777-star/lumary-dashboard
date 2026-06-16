"use client"

import { useEffect } from "react"
import { Construction, ExternalLink } from "lucide-react"

const ITEMS = [
  { skill: "Masonry", product: "Mason Job App", stack: "React Native + Supabase" },
  { skill: "Soil Mechanics", product: "Construction Calculator App", stack: "Next.js + Python" },
  { skill: "Architectural Drawing", product: "AR Blueprint Viewer", stack: "React Native + ARKit" },
  { skill: "Mathematics", product: "Quantity Surveyor Tool", stack: "React + Prisma" },
  { skill: "Arc Welding", product: "Welding Certification Tracker", stack: "Next.js + PostgreSQL" },
  { skill: "Spreadsheets", product: "Construction ERP Lite", stack: "React + Node.js" },
  { skill: "Plumbing", product: "Plumbing Estimator App", stack: "React Native" },
]

export default function ConbridgePage() {
  useEffect(() => { document.title = "Construction → Product Bridge — LUMARY Studio" }, [])

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Construction className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Construction → Product Bridge</h2>
          <p className="text-xs text-on-surface-variant/80">Turning trade skills into digital products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {ITEMS.map((item, i) => (
          <div key={i} className="glass-card p-card-padding card-hover flex flex-col relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-20 h-20 grad-orange rounded-full opacity-10 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  idea
                </span>
                <ExternalLink className="w-4 h-4 text-on-surface-variant/80" />
              </div>
              <h3 className="text-sm font-bold text-on-surface mb-2">{item.skill}</h3>
              <p className="text-xs text-on-surface-variant/70 font-medium mb-2">→ {item.product}</p>
              <div className="mt-auto pt-3 border-t border-outline-variant/10">
                <span className="text-[11px] font-mono text-primary bg-primary/5 px-2 py-1 rounded-md">{item.stack}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
