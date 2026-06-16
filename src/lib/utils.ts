import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTSh(amount: number): string {
  if (amount >= 1_000_000) {
    const m = (amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)
    return `TSh ${m}M`
  }
  if (amount >= 1_000) {
    const k = (amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)
    return `TSh ${k}K`
  }
  return new Intl.NumberFormat("sw-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "sasa hivi"
  if (minutes < 60) return `${minutes}d ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("sw-TZ", { month: "short", day: "numeric" })
}

export function maskPhone(phone: string): string {
  if (phone.length < 8) return phone
  return phone.slice(0, 6) + "****" + phone.slice(-3)
}
