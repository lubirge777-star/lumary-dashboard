"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  showTagline?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  link?: boolean
  variant?: "full" | "icon" | "mark"
}

const sizes = {
  sm: { icon: 28, text: "text-lg", tagline: "text-[10px]", gap: "gap-2", badge: "text-[9px]" },
  md: { icon: 36, text: "text-2xl", tagline: "text-xs", gap: "gap-2.5", badge: "text-[10px]" },
  lg: { icon: 48, text: "text-[32px]", tagline: "text-sm", gap: "gap-3", badge: "text-[11px]" },
}

function LogoMark({ size }: { size: number }) {
  const s = size / 48
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8E5E" />
          <stop offset="100%" stopColor="#9d4319" />
        </linearGradient>
        <linearGradient id="lm2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4FACFE" />
          <stop offset="100%" stopColor="#00629f" />
        </linearGradient>
        <linearGradient id="lm3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C896FF" />
          <stop offset="100%" stopColor="#7e35ca" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#lm)" opacity="0.08" />
      <path d="M16 10h10v24h18v8H16V10z" fill="url(#lm)" />
      <path d="M34 8l12 12-12 12V8z" fill="url(#lm2)" opacity="0.7" />
      <circle cx="44" cy="40" r="3.5" fill="url(#lm3)" />
    </svg>
  )
}

export function Logo({ showTagline = false, size = "md", className, link = true, variant = "full" }: LogoProps) {
  const s = sizes[size]

  if (variant === "icon") {
    const el = (
      <div className={cn("relative shrink-0", className)}>
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FF8E5E] to-[#4FACFE] rounded-xl blur opacity-20" />
        <LogoMark size={s.icon} />
      </div>
    )
    if (link) return <Link href="/">{el}</Link>
    return el
  }

  const content = (
    <div className={cn("flex items-center", s.gap, className)}>
      <div className="relative shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FF8E5E] to-[#4FACFE] rounded-xl blur opacity-20" />
        <LogoMark size={s.icon} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={cn("font-heading font-bold tracking-tighter leading-none", s.text)}>
            LUMARY
          </span>
          <span className={cn("bg-[#FF8E5E]/12 text-[#9d4319] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-[1.5px] border border-[#FF8E5E]/20", s.badge)}>
            Studio
          </span>
        </div>
        {showTagline && (
          <p className={cn("text-on-surface-variant/80 tracking-wide mt-0.5", s.tagline)}>
            Creative Business Suite
          </p>
        )}
      </div>
    </div>
  )

  if (link) return <Link href="/">{content}</Link>
  return content
}
