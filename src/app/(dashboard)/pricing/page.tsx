"use client"

import { useEffect, useState } from "react"
import clsx from "clsx"
import {
  Calculator, ShieldCheck, TrendingUp, Package, Zap, DollarSign, RefreshCw,
  CheckCircle, XCircle, Table, BookOpen, Lightbulb, Handshake,
} from "lucide-react"

const RATE = 1550

const services = [
  { name: "YouTube thumbnail", floor: 3000, ceiling: 12000, usd: "$2-8", time: "1-2 hrs" },
  { name: "WhatsApp advert", floor: 3000, ceiling: 8000, usd: "$2-5", time: "1 hr" },
  { name: "Business flyer", floor: 5000, ceiling: 18000, usd: "$3-12", time: "1-3 hrs" },
  { name: "Event flyer", floor: 8000, ceiling: 25000, usd: "$5-16", time: "2-4 hrs" },
  { name: "CV redesign", floor: 8000, ceiling: 20000, usd: "$5-13", time: "1-2 hrs" },
  { name: "Simple logo", floor: 15000, ceiling: 50000, usd: "$10-32", time: "3-8 hrs" },
  { name: "Business Starter Pack", floor: 45000, ceiling: 90000, usd: "$29-58", time: "1-2 days" },
  { name: "Student Pack", floor: 20000, ceiling: 40000, usd: "$13-26", time: "3-5 hrs" },
  { name: "WhatsApp Vendor Pack", floor: 25000, ceiling: 55000, usd: "$16-35", time: "4-6 hrs" },
  { name: "Monthly WhatsApp retainer", floor: 40000, ceiling: 80000, usd: "$26-52/mo", time: "4-6 hrs/mo" },
  { name: "Monthly Social Media Pack", floor: 60000, ceiling: 110000, usd: "$39-71/mo", time: "6-9 hrs/mo" },
  { name: "WhatsApp Business setup", floor: 15000, ceiling: 35000, usd: "$10-23", time: "1-2 hrs" },
  { name: "Google My Business setup", floor: 20000, ceiling: 45000, usd: "$13-29", time: "1-2 hrs" },
  { name: "Basic website", floor: 150000, ceiling: 400000, usd: "$97-259", time: "3-7 days" },
]

const philosophyRules = [
  { icon: TrendingUp, title: "Start low, raise fast", desc: "Start at the lower end of your price range. Raise your rate after every 3 successful projects in that category." },
  { icon: ShieldCheck, title: "Never discount below minimum", desc: "If a client pushes below your floor price, walk away. Discounts train clients to negotiate every time." },
  { icon: Package, title: "Quote a package, not a price list", desc: "Always bundle services into packages. A package feels like value — a price list invites cherry-picking." },
  { icon: Zap, title: "Rush fee is legitimate", desc: "For urgent requests, add 50% to your standard quote. Rush work disrupts your schedule — charge for it." },
  { icon: DollarSign, title: "International clients pay in USD", desc: "International clients must be quoted and billed in USD. This protects you from TSh volatility." },
  { icon: RefreshCw, title: "Retainers beat one-off jobs", desc: "A retainer gives predictable monthly income. Prioritise retainer relationships over single projects." },
]

const correctResponses = [
  "I understand budget is important. Let me adjust the scope to match what you can invest.",
  "Here's what I can do within that range — it covers the core deliverables.",
  "Let me put together a package that works for both of us.",
]

const wrongResponses = [
  "How much can you pay? I'll try to match it.",
  "Okay, I'll do it for half price just this once.",
  "That's way too low. You're wasting my time.",
]

const serviceNames = services.map((s) => s.name)

export default function PricingPage() {
  useEffect(() => { document.title = "Pricing — LUMARY Studio" }, [])

  const [selectedService, setSelectedService] = useState(serviceNames[0])
  const [tshAmount, setTshAmount] = useState<number>(services[0].floor)
  const [revisionLimit, setRevisionLimit] = useState(2)

  const service = services.find((s) => s.name === selectedService)!
  const usdAmount = tshAmount / RATE
  const deposit50 = tshAmount * 0.5

  const upsellSuggestions = [
    `${selectedService} + Social Media promo (add 50%)`,
    `${selectedService} + 1 month retainer support`,
    `${selectedService} + Revision extension pack`,
  ]

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">Pricing &amp; Quoting</h1>
        <p className="text-sm text-on-surface-variant/80 mt-1">
          Service pricing tables, quote generator, and package builder
        </p>
      </div>

      {/* Quick Reference Pricing Table */}
      <div className="glass-card p-card-padding">
        <div className="flex items-center gap-2 mb-5">
          <Table className="w-5 h-5 text-primary" />
          <h3 className="text-headline-md font-bold text-on-surface">Quick Reference Pricing</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left text-label-sm text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4 font-semibold">Service</th>
                <th className="text-right text-label-sm text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4 font-semibold">Floor (TSh)</th>
                <th className="text-right text-label-sm text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4 font-semibold">Ceiling (TSh)</th>
                <th className="text-right text-label-sm text-on-surface-variant/80 uppercase tracking-wider pb-3 pr-4 font-semibold">USD Range</th>
                <th className="text-right text-label-sm text-on-surface-variant/80 uppercase tracking-wider pb-3 font-semibold">Est. Time</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc, i) => (
                <tr
                  key={svc.name}
                  className={clsx(
                    "border-b border-outline-variant/10 transition-all hover:bg-black/[0.02]",
                    i === services.length - 1 && "border-b-0"
                  )}
                >
                  <td className="py-3 pr-4 font-medium text-on-surface whitespace-nowrap">{svc.name}</td>
                  <td className="py-3 pr-4 text-right font-mono text-on-surface">{svc.floor.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right font-mono text-on-surface">{svc.ceiling.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right font-mono text-on-surface-variant/70">{svc.usd}</td>
                  <td className="py-3 text-right text-on-surface-variant/80 whitespace-nowrap">{svc.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Generator */}
      <div className="glass-card p-card-padding">
        <div className="flex items-center gap-2 mb-5">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="text-headline-md font-bold text-on-surface">Quote Generator</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Service</label>
              <select
                value={selectedService}
                onChange={(e) => {
                  const s = services.find((x) => x.name === e.target.value)!
                  setSelectedService(e.target.value)
                  setTshAmount(s.floor)
                }}
                className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all"
              >
                {serviceNames.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Amount (TSh)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono text-on-surface-variant/80">TSh</span>
                <input
                  type="number"
                  value={tshAmount}
                  onChange={(e) => setTshAmount(Number(e.target.value) || 0)}
                  min={0}
                  className="w-full bg-white border border-outline-variant rounded-xl pl-12 pr-4 py-2.5 text-sm text-on-surface font-mono text-right focus:outline-none focus:border-primary/40 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Revision Limit</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={revisionLimit}
                  onChange={(e) => setRevisionLimit(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm font-mono text-on-surface font-semibold w-6 text-right">{revisionLimit}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/60 border border-outline-variant/20 rounded-xl p-5 space-y-4">
            <h4 className="text-label-bold text-on-surface-variant uppercase tracking-wider">Quote Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                <span className="text-sm text-on-surface-variant/70">USD Equivalent</span>
                <span className="text-sm font-mono font-semibold text-on-surface">
                  ${usdAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                <span className="text-sm text-on-surface-variant/70">50% Deposit</span>
                <span className="text-sm font-mono font-semibold text-primary">
                  TSh {deposit50.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                <span className="text-sm text-on-surface-variant/70">Rate</span>
                <span className="text-sm font-mono text-on-surface">
                  1 USD = {RATE} TSh
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-on-surface-variant/70">Revisions</span>
                <span className="text-sm font-mono font-semibold text-on-surface">{revisionLimit} included</span>
              </div>
            </div>

            {/* Upsell suggestions */}
            <div>
              <h4 className="text-label-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Suggested Upsell Packages
              </h4>
              <ul className="space-y-1.5">
                {upsellSuggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant/80">
                    <span className="text-primary mt-0.5 shrink-0">+</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Philosophy */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-headline-md font-bold text-on-surface">Pricing Philosophy</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {philosophyRules.map((rule) => {
            const Icon = rule.icon
            return (
              <div key={rule.title} className="glass-card p-card-padding card-hover">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-on-surface mb-1.5">{rule.title}</h4>
                <p className="text-xs text-on-surface-variant/70 leading-relaxed">{rule.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Price Negotiation */}
      <div className="glass-card p-card-padding">
        <div className="flex items-center gap-2 mb-5">
          <Handshake className="w-5 h-5 text-primary" />
          <h3 className="text-headline-md font-bold text-on-surface">How to Handle Price Negotiation</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correct */}
          <div>
            <h4 className="text-label-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Correct Responses
            </h4>
            <ul className="space-y-2">
              {correctResponses.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/40">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-on-surface/80">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Wrong */}
          <div>
            <h4 className="text-label-bold text-error uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Wrong Responses
            </h4>
            <ul className="space-y-2">
              {wrongResponses.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-error/5 border border-error/15">
                  <XCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
                  <span className="text-sm text-on-surface/80">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
