"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none",
          {
            "bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20 shadow-md": variant === "primary",
            "border border-outline-variant dark:border-white/10 bg-white dark:bg-surface-container-high text-on-surface hover:bg-surface-container-high hover:border-outline": variant === "secondary",
            "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-black/5": variant === "ghost",
            "bg-error text-on-error hover:shadow-lg hover:shadow-error/20": variant === "destructive",
            "border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40": variant === "outline",
          },
          {
            "h-8 px-3 text-xs gap-1.5": size === "sm",
            "h-9 px-4 gap-2": size === "md",
            "h-10 px-6 gap-2.5": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
