"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Bot, Sparkles, X, Lightbulb, TrendingUp, AlertTriangle, ChevronRight, Loader2 } from "lucide-react"

export default function CopilotWidget() {
  const [isOpen, setIsOpen] = useState(false)

  const { data: digest, isLoading } = useQuery({
    queryKey: ["ai-digest"],
    queryFn: () => fetch("/api/v1/ai/digest").then((r) => r.json()),
    enabled: isOpen,
    refetchInterval: 60000,
  })

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 z-50 rounded-2xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/10 shadow-2xl shadow-black/10 overflow-hidden animate-fadeInUp">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-on-surface">AI Copilot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-outline-variant/30 transition-all"
            >
              <X className="w-4 h-4 text-on-surface-variant/80" />
            </button>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : digest ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/50 dark:bg-amber-900/20 dark:border-amber-800/30">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {digest.activeProjects > 0
                      ? `${digest.activeProjects} active projects • ${digest.stalledProjects} stalled`
                      : "No active projects"}
                  </p>
                </div>

                {digest.pendingInvoices > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200/50 dark:bg-blue-900/20 dark:border-blue-800/30">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      {digest.pendingInvoices} pending invoice(s) — TSh {digest.unpaidAmount.toLocaleString()}
                    </p>
                  </div>
                )}

                {digest.topRecommendations?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-semibold">Recommendations</p>
                    {digest.topRecommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-on-surface/80">{rec}</p>
                      </div>
                    ))}
                  </div>
                )}

                {digest.newClients > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/50 dark:bg-emerald-900/20 dark:border-emerald-800/30">
                    <AlertTriangle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-800 dark:text-emerald-200">
                      {digest.newClients} new client(s) this week — send welcome messages
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-on-surface-variant/80 text-center py-4">Loading insights...</p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </button>
    </>
  )
}
