"use client"

import { useEffect } from "react"
import { RESOURCES } from "@/lib/v7-data/resources"
import { BookOpen, ExternalLink } from "lucide-react"

export default function ResourcesPage() {
  useEffect(() => { document.title = "Resources — LUMARY Studio" }, [])

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-headline-lg font-bold text-on-surface">Curated Resources</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        {RESOURCES.map((resource, i) => (
          <a
            key={i}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-card-padding card-hover flex flex-col group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{resource.icon}</span>
              <ExternalLink className="w-4 h-4 text-on-surface-variant/80 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{resource.title}</h3>
            <p className="text-xs text-on-surface-variant/70 leading-relaxed flex-1">{resource.desc}</p>
            <div className="mt-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${resource.color} bg-current/10`}>
                {resource.tag}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
