"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Search,
  Users,
  Kanban,
  Wallet,
  BarChart3,
  Send,
  Repeat,
  Calendar,
  Settings,
  Zap,
  LayoutDashboard,
  FileText,
} from "lucide-react"
import type { Client, Project, Payment } from "@/types"

interface CommandItem {
  id: string
  label: string
  description: string
  href: string
  icon: React.ReactNode
  keywords: string[]
}

const NAV_ITEMS: CommandItem[] = [
  { id: "nav-overview", label: "Overview", description: "Dashboard home", href: "/", icon: <LayoutDashboard className="w-4 h-4" />, keywords: ["home", "dashboard", "main"] },
  { id: "nav-clients", label: "Clients", description: "Manage clients", href: "/clients", icon: <Users className="w-4 h-4" />, keywords: ["customers", "people", "contacts"] },
  { id: "nav-projects", label: "Pipeline", description: "Project kanban board", href: "/projects", icon: <Kanban className="w-4 h-4" />, keywords: ["kanban", "tasks", "stages"] },
  { id: "nav-messages", label: "Messages", description: "WhatsApp inbox", href: "/messages", icon: <Send className="w-4 h-4" />, keywords: ["chat", "whatsapp", "inbox", "conversations"] },
  { id: "nav-calendar", label: "Calendar", description: "Appointments & schedule", href: "/calendar", icon: <Calendar className="w-4 h-4" />, keywords: ["schedule", "appointments", "events"] },
  { id: "nav-retainers", label: "Retainers", description: "Monthly retainer packages", href: "/retainers", icon: <Repeat className="w-4 h-4" />, keywords: ["subscriptions", "monthly", "packages"] },
  { id: "nav-finance", label: "Finance", description: "Payments & expenses", href: "/finance", icon: <Wallet className="w-4 h-4" />, keywords: ["money", "payments", "income", "p&l"] },
  { id: "nav-analytics", label: "Analytics", description: "Charts & insights", href: "/analytics", icon: <BarChart3 className="w-4 h-4" />, keywords: ["charts", "reports", "statistics"] },
  { id: "nav-automation", label: "Automation", description: "Automation rules", href: "/automation", icon: <Zap className="w-4 h-4" />, keywords: ["rules", "triggers", "workflows"] },
  { id: "nav-settings", label: "Settings", description: "Pricing, integrations, users", href: "/settings", icon: <Settings className="w-4 h-4" />, keywords: ["preferences", "config", "users", "pricing"] },
]

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { data: clients = [] } = useQuery({
    queryKey: ["command-search-clients"],
    queryFn: () => fetch("/api/v1/clients?limit=20").then((r) => r.json()).then((d) => d.items ?? []),
    enabled: open,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ["command-search-projects"],
    queryFn: () => fetch("/api/v1/projects?limit=20").then((r) => r.json()).then((d) => d.items ?? []),
    enabled: open,
  })

  const allItems: CommandItem[] = [
    ...NAV_ITEMS,
    ...(clients as Client[]).map((c) => ({
      id: `client-${c.id}`,
      label: c.name,
      description: `Client • ${c.businessType || c.whatsappNumber}`,
      href: `/clients/${c.id}`,
      icon: <Users className="w-4 h-4" />,
      keywords: [c.name, c.whatsappNumber, c.businessType || "", "client", "customer"].filter(Boolean),
    })),
    ...(projects as Project[]).map((p) => ({
      id: `project-${p.id}`,
      label: `${p.clientName || "Unknown"} — ${p.serviceType}`,
      description: `Project • ${p.quotedAmount ? `TSh ${p.quotedAmount.toLocaleString()}` : ""}`,
      href: `/projects`,
      icon: <FileText className="w-4 h-4" />,
      keywords: [p.clientName || "", p.serviceType, "project"].filter(Boolean),
    })),
  ]

  const results = query.trim()
    ? allItems.filter((item) => {
        const q = query.toLowerCase()
        return (
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q))
        )
      })
    : allItems.slice(0, 10)

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
    }
  }, [open])

  const navigate = useCallback(
    (item: CommandItem) => {
      setOpen(false)
      setQuery("")
      router.push(item.href)
    },
    [router]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault()
        navigate(results[selectedIndex])
      }
    },
    [results, selectedIndex, navigate]
  )

  return {
    open,
    setOpen,
    query,
    setQuery,
    results,
    selectedIndex,
    navigate,
    handleKeyDown,
    inputRef,
  }
}
