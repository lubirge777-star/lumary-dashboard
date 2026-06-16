"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import {
  MessageSquareReply, Plus, X, Copy, Check,
  Search, AlertCircle, MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

const defaultTemplates = [
  { shortcut: "inquiry", title: "First Contact", category: "inquiry", content: "Habari! Asante kwa kuwasiliana. Niambie zaidi kuhusu unachohitaji — ni nini hasa, litatumika wapi, na deadline yako ni lini? Nitakuambia bei na muda wa kukamilisha." },
  { shortcut: "quote", title: "Send Quote", category: "quoting", content: "Hapa kuna quotation yangu: [DESCRIPTION]. Bei: TSh [AMOUNT]. Inajumuisha marekebisho 2. Itakuwa tayari ndani ya [TIMEFRAME]. Deposit ya 50% (TSh [HALF]) inahitajika kabla ya kuanza. Unataka tuendelee?" },
  { shortcut: "deliver", title: "First Version", category: "delivery", content: "Hapa kuna version ya kwanza. Niambie mawazo yako na nitafanya marekebisho kama inahitajika. Link ya file ya ubora wa juu: [GOOGLE_DRIVE_LINK]" },
  { shortcut: "payment", title: "Request Payment", category: "payment", content: "Hii ni version ya mwisho. Tuma salio la TSh [AMOUNT] kwa [MPESA_NUMBER] kukamilisha. Asante kwa ushirikiano wako." },
  { shortcut: "testimonial", title: "Request Testimonial", category: "followup", content: "Habari [NAME]. Je, watu wanaipendaje design? Ningependa kukuuliza uniandikie ujumbe mfupi kuhusu uzoefu wako nami — ili niweze kuuonyesha wengine. Pia, kama unahitaji kazi zaidi au unafahamu mtu anayehitaji design, nitafurahi kusaidia." },
  { shortcut: "followup-overdue", title: "Overdue Follow-up", category: "followup", content: "Habari [NAME]. Nilituma kazi yako wiki iliyopita — bado unasubiri kulipa salio la TSh [AMOUNT]. Asante." },
  { shortcut: "rush", title: "Rush Fee", category: "quoting", content: "Naweza kukamilisha ifikapo [TIME] leo kwa ada ya haraka ya TSh [RUSH_FEE]. Je, hiyo inakufaa?" },
  { shortcut: "retainer-renew", title: "Retainer Renewal", category: "retainer", content: "Hapa kuna muhtasari wa kazi tuliyofanya mwezi huu: [SUMMARY]. Kufanya upya mwezi ujao ni TSh [AMOUNT] kama kawaida. Ninaweza pia kuongeza [UPSELL] kwa TSh [UPSELL_PRICE] ziada kama una [ITEM] mpya." },
]

export default function TemplatesPage() {
  useEffect(() => { document.title = "Templates — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data: templates = [], isLoading, error, refetch } = useQuery({
    queryKey: ["templates", category],
    queryFn: () => fetch(`/api/v1/templates${category ? `?category=${category}` : ""}`).then((r) => r.json()),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/templates?id=${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  })

  const categories = [
    { label: "All", value: null },
    { label: "Inquiry", value: "inquiry" },
    { label: "Quoting", value: "quoting" },
    { label: "Delivery", value: "delivery" },
    { label: "Payment", value: "payment" },
    { label: "Follow-up", value: "followup" },
    { label: "Retainer", value: "retainer" },
  ]

  const templateList = Array.isArray(templates) && templates.length > 0 ? templates : defaultTemplates

  const filtered = templateList.filter((t: any) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.content.toLowerCase().includes(search.toLowerCase())) return false
    if (category && t.category !== category) return false
    return true
  })

  const copyToClipboard = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Response Templates</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Swahili client communication quick replies</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/80" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-white dark:bg-surface-container-low border border-outline-variant rounded-xl pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.value ?? "all"}
              onClick={() => setCategory(c.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                category === c.value
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-white dark:bg-surface-container-low text-on-surface-variant border border-outline-variant hover:border-primary/30 hover:text-primary"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
            <p className="text-sm text-on-surface-variant mb-4">Failed to load templates</p>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">Retry</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-7 h-7" />}
          title="No templates found"
          description={search ? "Try a different search term" : "No templates in this category"}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((t: any) => (
            <div key={t.id || t.shortcut} className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-5 card-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquareReply className="w-4 h-4 text-primary shrink-0" />
                    <h4 className="text-sm font-semibold text-on-surface">{t.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">{t.category}</span>
                  </div>
                  <div className="bg-outline-variant/10 rounded-xl p-4 font-mono text-xs text-on-surface-variant leading-relaxed">
                    {t.content}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => copyToClipboard(t.id || t.shortcut, t.content)}
                    className="w-8 h-8 rounded-lg hover:bg-outline-variant/30 flex items-center justify-center text-on-surface-variant/80 hover:text-on-surface transition-all"
                    title="Copy to clipboard"
                  >
                    {copiedId === (t.id || t.shortcut) ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 p-5">
        <p className="text-xs text-amber-800 dark:text-amber-300 font-medium mb-2">💡 Save these as WhatsApp quick replies</p>
        <p className="text-xs text-amber-700 dark:text-amber-400/70 leading-relaxed">
          Copy the templates you use most and save them as WhatsApp Business quick replies.
          Go to WhatsApp Business → Settings → Business Tools → Quick Replies.
          Consistent, professional responses build trust faster than any portfolio piece.
        </p>
      </div>
    </div>
  )
}
