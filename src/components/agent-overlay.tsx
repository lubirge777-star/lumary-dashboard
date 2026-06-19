"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { Bot, Sparkles, X, Send, Loader2, Terminal, Mic, Volume2, PanelRightClose, PanelRightOpen } from "lucide-react"
import Markdown from "@/components/agent/markdown"
import VoiceRecorder from "@/components/voice-recorder"
import clsx from "clsx"

interface AgentMessage {
  role: "user" | "agent"
  content: string
  actions?: AgentAction[]
}

interface AgentAction {
  label: string
  description?: string
  apiRoute?: string
  method?: string
  body?: Record<string, unknown>
}

export default function AgentOverlay() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: "agent",
      content: "I'm your studio agent. I can help you navigate, run commands, and answer questions about any page.",
    },
  ])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get current page name from pathname
  const currentPage = pathname === "/" ? "Overview" : pathname.split("/").pop() || "Dashboard"
  const pageLabel = currentPage.charAt(0).toUpperCase() + currentPage.slice(1)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, streamingContent])

  const handleSend = useCallback(async (text?: string) => {
    const message = text || input.trim()
    if (!message) return

    const userMsg: AgentMessage = { role: "user", content: message }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setError(null)
    setIsStreaming(true)
    setStreamingContent("")

    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/v1/agent/overlay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          page: pathname,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) { setError("Agent unavailable"); setIsStreaming(false); return }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No reader")
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.event === "chunk" && data.data?.text) {
              setStreamingContent((prev) => prev + data.data.text)
            } else if (data.event === "done") {
              setMessages((prev) => [...prev, { role: "agent", content: data.data.full || streamingContent, actions: data.data.actions }])
              setStreamingContent("")
              setIsStreaming(false)
            } else if (data.event === "error") {
              setError(data.data?.message || "Error")
              setIsStreaming(false)
              setStreamingContent("")
            }
          } catch {}
        }
      }
      if (streamingContent) {
        setMessages((prev) => [...prev, { role: "agent", content: streamingContent }])
        setStreamingContent("")
      }
      setIsStreaming(false)
    } catch (err: any) {
      if (err.name !== "AbortError") setError("Connection lost")
      setIsStreaming(false)
    }
  }, [input, messages, pathname, streamingContent])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleTranscription = (text: string) => { setInput(text); setTimeout(() => handleSend(text), 100) }

  const handleAction = async (action: AgentAction) => {
    if (!action.apiRoute) return
    try {
      const res = await fetch(action.apiRoute, {
        method: action.method || "POST",
        headers: { "Content-Type": "application/json" },
        body: action.body ? JSON.stringify(action.body) : undefined,
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "agent", content: `✅ **${action.label}** complete.\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`` }])
    } catch {
      setMessages((prev) => [...prev, { role: "agent", content: `❌ **${action.label}** failed. Check permissions and try again.` }])
    }
  }

  return (
    <>
      {/* Panel */}
      <div
        className={clsx(
          "fixed z-50 transition-all duration-300 flex flex-col",
          isOpen
            ? fullScreen
              ? "inset-0 m-0 rounded-none"
              : "bottom-20 right-4 w-[420px] h-[600px] rounded-2xl shadow-2xl shadow-black/10"
            : "bottom-20 right-4 w-0 h-0 opacity-0 pointer-events-none",
          "bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/10 overflow-hidden",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 bg-gradient-to-r from-primary/5 to-secondary/5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-on-surface">Agent</span>
            <span className="text-[10px] text-on-surface-variant/50 bg-surface-variant/30 px-1.5 py-0.5 rounded-md ml-1">
              {pageLabel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setFullScreen(!fullScreen)} className="p-1.5 rounded-lg hover:bg-outline-variant/30 text-on-surface-variant/60 transition-all" title={fullScreen ? "Minimize" : "Expand"}>
              {fullScreen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
            <button onClick={() => { setIsOpen(false); setFullScreen(false) }} className="p-1.5 rounded-lg hover:bg-outline-variant/30 text-on-surface-variant/60 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={clsx("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "")}>
              <div className={clsx(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "agent"
                  ? "bg-surface-variant/20 border border-outline-variant/10"
                  : "bg-gradient-to-br from-primary to-secondary text-white",
              )}>
                {msg.role === "agent" ? <Markdown content={msg.content} /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-outline-variant/20">
                    {msg.actions.map((action, ai) => (
                      <button
                        key={ai}
                        onClick={() => handleAction(action)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all"
                      >
                        <Terminal className="w-3 h-3" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isStreaming && streamingContent && (
            <div className="flex gap-2">
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-surface-variant/20 border border-outline-variant/10 text-sm">
                <Markdown content={streamingContent} />
                <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5 rounded-sm" />
              </div>
            </div>
          )}

          {isStreaming && !streamingContent && (
            <div className="flex gap-2">
              <div className="rounded-2xl px-4 py-3 bg-surface-variant/20 border border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs text-on-surface-variant/50 ml-1">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && <div className="text-xs text-error text-center py-2">{error}</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-outline-variant/20 p-3">
          <div className="flex items-end gap-2">
            <VoiceRecorder onTranscription={handleTranscription} disabled={isStreaming} />
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${pageLabel}...`}
                rows={1}
                disabled={isStreaming}
                className="w-full bg-surface-variant/10 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/30 resize-none disabled:opacity-50"
                style={{ minHeight: "38px", maxHeight: "80px" }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "fixed z-50 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl active:scale-95",
          isOpen
            ? "bottom-4 right-4 w-10 h-10 rounded-xl bg-surface-variant/80 text-on-surface-variant border border-outline-variant/30"
            : "bottom-4 right-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-primary/20 hover:shadow-primary/30",
        )}
        title={isOpen ? "Close agent" : "Open agent"}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
      </button>
    </>
  )
}
