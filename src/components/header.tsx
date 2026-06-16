"use client"

import { Bell, Search } from "lucide-react"

export function Header() {
  return (
    <header className="h-16 border-b border-[#2a2a3a] flex items-center justify-between px-6 bg-[#0a0a0f]">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b7b]" />
          <input
            type="text"
            placeholder="Search clients, projects..."
            className="w-full bg-[#14141f] border border-[#2a2a3a] rounded-lg pl-10 pr-4 py-2 text-sm text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#d4a853]/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-[#14141f] transition-colors">
          <Bell className="w-5 h-5 text-[#a0a0b0]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d4a853]" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-[#2a2a3a]">
          <div className="w-8 h-8 rounded-full bg-[#d4a853]/20 flex items-center justify-center text-[#d4a853] font-medium text-sm">
            L
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[#f5f5f7]">Lubirge</p>
            <p className="text-xs text-[#6b6b7b]">Owner</p>
          </div>
        </div>
      </div>
    </header>
  )
}
