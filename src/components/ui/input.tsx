"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 transition-all duration-200",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)]",
            "hover:border-outline",
            error && "border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(186,26,26,0.08)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-error animate-fadeIn">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; options: { value: string; label: string }[] }
>(({ className, label, error, options, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-on-surface-variant">{label}</label>}
      <select
        ref={ref}
        className={cn(
          "w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface transition-all duration-200",
          "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)]",
          "hover:border-outline",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-error animate-fadeIn">{error}</p>}
    </div>
  )
})
Select.displayName = "Select"
