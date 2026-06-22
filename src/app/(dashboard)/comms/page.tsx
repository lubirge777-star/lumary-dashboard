"use client"

import { Suspense, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Send, MessageSquare, FileText, Settings2, Share2, Mail,
} from "lucide-react"
import clsx from "clsx"

const tabs = [
  { label: "Templates", href: "/templates", icon: FileText, key: "templates" },
  { label: "Automation", href: "/automation", icon: Settings2, key: "automation" },
  { label: "Content", href: "/content", icon: Send, key: "content" },
  { label: "Social", href: "/social", icon: Share2, key: "social" },
  { label: "Inbox", href: "/messages", icon: Mail, key: "inbox" },
]

function CommsContent() {
  useEffect(() => { document.title = "Comms — LUMARY Studio" }, [])
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "templates"

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Send className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-headline-lg font-bold text-on-surface">Communications Hub</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/60"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className="glass-card p-6 card-hover flex flex-col items-center gap-3 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-on-surface">{tab.label}</h3>
              <p className="text-sm text-on-surface-variant/70">
                Manage your {tab.label.toLowerCase()}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function CommsHubPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 rounded-xl bg-surface-variant/30" />}>
      <CommsContent />
    </Suspense>
  )
}
