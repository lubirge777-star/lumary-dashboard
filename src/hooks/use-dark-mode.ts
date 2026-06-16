"use client"

import { useState, useEffect, useCallback } from "react"

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("lumary-dark-mode")
    if (stored !== null) {
      setIsDark(stored === "true")
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("lumary-dark-mode", String(isDark))
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark, mounted])

  const toggle = useCallback(() => setIsDark((prev) => !prev), [])

  return { isDark, toggle, mounted }
}
