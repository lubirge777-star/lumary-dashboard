"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Users, Kanban, Send,
  Repeat, Wallet, Sparkles, Settings,
  LogOut, Search, Mail, Zap, Calendar,
  Menu, X, BarChart3, ClipboardList,
  Receipt, CalendarCheck, GraduationCap,
  Lightbulb, MessageSquareReply,
  BookOpen, Clock, PenLine, Target, BookMarked,
  Palette, TrendingUp, Flame, Brain, Globe,
  Trophy, Film, Heart, Building2,
  CheckSquare, ListChecks, Eye, Briefcase, Cloud,
  Sun, Bot,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import clsx from "clsx"
import CopilotWidget from "@/components/copilot-widget"
import NotificationDropdown from "@/components/notification-dropdown"
import { ErrorBoundary } from "@/components/error-boundary"
import { RoleBadge } from "@/components/use-role"
import { Logo } from "@/components/brand/logo"
import { CommandPalette } from "@/components/command-palette"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

const nav = {
  dashboard: [
    { label: "Today", href: "/today", icon: Sun },
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Agent", href: "/agent", icon: Bot },
  ],
  business: [
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Pipeline", href: "/projects", icon: Kanban },
    { label: "Messages", href: "/messages", icon: Send },
    { label: "Finance", href: "/finance", icon: Wallet },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Retainers", href: "/retainers", icon: Repeat },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Content", href: "/content", icon: CalendarCheck },
  ],
  operations: [
    { label: "Automation", href: "/automation", icon: Zap },
    { label: "Agent Cron", href: "/agent?tab=cron", icon: Clock },
    { label: "Templates", href: "/templates", icon: MessageSquareReply },
    { label: "Pricing", href: "/pricing", icon: Receipt },
    { label: "Operations", href: "/operations", icon: ClipboardList },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  growth: [
    { label: "Learning", href: "/learning", icon: Brain },
    { label: "Roadmap", href: "/roadmap", icon: TrendingUp },
    { label: "Figma", href: "/figma-path", icon: Palette },
    { label: "Skill Radar", href: "/skill-radar", icon: Eye },
    { label: "Grades", href: "/grades", icon: GraduationCap },
    { label: "Reading", href: "/reading", icon: BookOpen },
    { label: "Resources", href: "/resources", icon: Globe },
  ],
  personal: [
    { label: "Habits", href: "/habits", icon: CheckSquare },
    { label: "Timer", href: "/timer", icon: Clock },
    { label: "Journal", href: "/journal", icon: PenLine },
    { label: "Goals", href: "/goals", icon: Target },
    { label: "Arabic", href: "/arabic", icon: BookMarked },
    { label: "Focus", href: "/focus", icon: Zap },
    { label: "Heatmap", href: "/heatmap", icon: Flame },
    { label: "Trajectory", href: "/trajectory", icon: Trophy },
  ],
  ventures: [
    { label: "Ideas", href: "/ideas", icon: Lightbulb },
    { label: "Portfolio", href: "/portfolio", icon: Briefcase },
    { label: "SaaS Bank", href: "/saas-bank", icon: Cloud },
    { label: "Network", href: "/network", icon: Users },
    { label: "ConBridge", href: "/conbridge", icon: Building2 },
    { label: "Accountability", href: "/accountability", icon: ListChecks },
    { label: "Weekly Review", href: "/weekly-review", icon: ClipboardList },
    { label: "Wedge", href: "/wedge", icon: Lightbulb },
  ],
  entertainment: [
    { label: "Movies", href: "/movies", icon: Film },
  ],
}

const bottomNav = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/projects", icon: Kanban, label: "Pipeline" },
  { href: "/messages", icon: Send, label: "Chat" },
  { href: "/finance", icon: BarChart3, label: "Finance" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string) => pathname === href

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "w-[280px] h-full fixed left-0 top-0 glass-panel border-r border-white/50 dark:border-white/10 flex flex-col z-50 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="px-container-padding py-8 flex items-center gap-3">
          <Logo size="md" link={false} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1 rounded-lg hover:bg-black/5 text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "business", label: "Business" },
            { key: "operations", label: "Operations" },
            { key: "growth", label: "Growth" },
            { key: "personal", label: "Personal" },
            { key: "ventures", label: "Ventures" },
            { key: "entertainment", label: "Entertainment" },
          ].map((section, si) => {
            const items = (nav as any)[section.key] || []
            if (items.length === 0) return null
            return (
              <div key={section.key}>
                {si > 0 && <div className="h-px bg-outline-variant/10 mx-4 my-3" />}
                <p className="text-label-bold text-on-surface-variant uppercase px-4 mb-2 tracking-widest opacity-70">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {items.map((item: any) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={clsx(
                          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
                          active
                            ? "bg-primary-container/10 text-primary font-bold shadow-sm"
                            : "text-on-surface-variant hover:bg-black/5"
                        )}
                      >
                        <Icon className={clsx("w-[18px] h-[18px] shrink-0", !active && "opacity-60")} />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 pb-6">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-on-surface-variant hover:bg-black/5 hover:text-error transition-all group"
          >
            <LogOut className="w-[22px] h-[22px] shrink-0 opacity-70 group-hover:opacity-100" />
            <span className="text-body-md">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[280px] h-full overflow-y-auto pb-20 lg:pb-0">
        {/* TopNavBar */}
        <header className="w-full h-24 sticky top-0 z-30 bg-background/40 backdrop-blur-md flex items-center justify-between px-4 md:px-container-padding border-b border-white/20">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-on-surface-variant hover:bg-black/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-headline-md lg:text-headline-xl text-on-surface font-bold truncate max-w-[200px] md:max-w-none">
              {Object.values(nav).flat().find((n: any) => isActive(n.href))?.label || "Overview"}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-8">
            {/* Search - desktop only */}
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", { metaKey: true, key: "k" })
                window.dispatchEvent(event)
              }}
              className="hidden md:flex items-center glass-panel border-white/40 rounded-full px-4 hover:border-primary/20 transition-all w-48 lg:w-72 cursor-pointer"
            >
              <Search className="w-5 h-5 text-on-surface-variant/80 shrink-0" />
              <span className="flex-1 bg-transparent text-body-md py-3 text-left text-on-surface-variant/70">
                Search...
              </span>
              <kbd className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-variant/50 text-[10px] text-on-surface-variant/70 font-mono shrink-0">
                <span>⌘</span>K
              </kbd>
            </button>
            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <DarkModeToggle />
              <button className="hidden md:flex w-12 h-12 rounded-full glass-panel items-center justify-center text-tertiary hover:scale-105 transition-all relative">
                <Mail className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-error rounded-full border-2 border-white" />
              </button>
              <NotificationDropdown />
              <div className="hidden md:block h-10 w-px bg-outline-variant/30 mx-2" />
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-container overflow-hidden border-2 border-white shadow-md transition-transform group-hover:scale-105 flex items-center justify-center text-on-primary-container font-semibold text-base md:text-lg">
                  {session?.user?.name?.charAt(0) || "L"}
                </div>
                <div className="hidden md:flex">
                  <RoleBadge role={(session?.user as any)?.role} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-3 md:px-container-padding py-4 md:py-gutter space-y-4 md:space-y-gutter">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
        <CopilotWidget />
        <CommandPalette />
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/30 dark:border-white/10 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {bottomNav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0",
                  active ? "text-primary" : "text-on-surface-variant/80 hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <Icon className={clsx("w-5 h-5", active && "fill-primary/10")} />
                <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
