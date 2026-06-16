"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles: Record<ToastType, { box: string; icon: string }> = {
  success: { box: "border-emerald-500/30 bg-emerald-500/5", icon: "text-emerald-600" },
  error: { box: "border-rose-500/30 bg-rose-500/5", icon: "text-rose-600" },
  info: { box: "border-secondary/30 bg-secondary/5", icon: "text-secondary" },
  warning: { box: "border-yellow-500/30 bg-yellow-500/5", icon: "text-amber-600" },
}

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500)
  }, [])

  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t, i) => {
          const Icon = icons[t.type]
          const s = styles[t.type]
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl bg-white/90 dark:bg-surface-container-high/90 shadow-xl shadow-black/5 ${s.box} animate-slideInRight`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${s.icon}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface">{t.title}</p>
                {t.message && <p className="text-xs text-on-surface-variant/70 mt-0.5 leading-relaxed">{t.message}</p>}
              </div>
              <button onClick={() => removeToast(t.id)} className="p-0.5 rounded hover:bg-black/5 transition-colors shrink-0 self-start">
                <X className="w-3.5 h-3.5 text-on-surface-variant/80" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
