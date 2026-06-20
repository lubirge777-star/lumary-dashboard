"use client"

import { Bell } from "lucide-react"

export default function NotificationDropdown() {
  return (
    <div className="relative">
      <button className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-secondary hover:scale-105 transition-all relative">
        <Bell className="w-5 h-5" />
      </button>
    </div>
  )
}
