"use client"

import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { AlertTriangle, OctagonX } from "lucide-react"

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string
  variant?: "danger" | "warning"
}) {
  const { toast } = useToast()

  const handleConfirm = async () => {
    try {
      await onConfirm()
      toast("success", "Done", title)
      onClose()
    } catch (err: any) {
      toast("error", "Failed", err?.message || "Something went wrong")
    }
  }

  const Icon = variant === "danger" ? OctagonX : AlertTriangle
  const iconColor = variant === "danger" ? "text-error" : "text-amber-600"

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center py-4">
        <div className={`w-14 h-14 rounded-full ${variant === "danger" ? "bg-error/10" : "bg-amber-50"} flex items-center justify-center mb-4`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        <p className="text-sm text-on-surface-variant/80 max-w-sm">{message}</p>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={variant === "danger" ? "destructive" : "primary"} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
