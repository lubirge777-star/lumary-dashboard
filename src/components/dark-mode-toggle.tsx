"use client"

import { Sun, Moon } from "lucide-react"
import { useDarkMode } from "@/hooks/use-dark-mode"

export function DarkModeToggle() {
  const { isDark, toggle, mounted } = useDarkMode()

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  return (
    <button
      onClick={toggle}
      className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-secondary hover:scale-105 transition-all"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
