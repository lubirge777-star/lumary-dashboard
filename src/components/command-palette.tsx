"use client"

import { Search, Command } from "lucide-react"
import { useCommandPalette } from "@/hooks/use-command-palette"

export function CommandPalette() {
  const {
    open,
    setOpen,
    query,
    setQuery,
    results,
    selectedIndex,
    navigate,
    handleKeyDown,
    inputRef,
  } = useCommandPalette()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white border border-outline-variant/30 shadow-2xl shadow-black/20 overflow-hidden animate-fadeInDown"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/20">
          <Search className="w-5 h-5 text-on-surface-variant/80 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, clients, projects..."
            className="flex-1 bg-transparent border-none text-base text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-variant/50 text-[10px] text-on-surface-variant/70 font-mono">
            <Command className="w-3 h-3" />K
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-on-surface-variant/70">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No results found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.id}
                onClick={() => navigate(item)}
                onMouseEnter={() => {}}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                  i === selectedIndex
                    ? "bg-primary/5 text-primary"
                    : "text-on-surface hover:bg-black/[0.02]"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  i === selectedIndex ? "bg-primary/10 text-primary" : "bg-surface-variant/50 text-on-surface-variant/80"
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <p className="text-xs text-on-surface-variant/80 truncate">{item.description}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 px-5 py-3 border-t border-outline-variant/20 bg-surface-container-low/50">
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/70">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-variant/50 font-mono">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/70">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-variant/50 font-mono">↵</kbd>
            <span>Open</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/70">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-variant/50 font-mono">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
