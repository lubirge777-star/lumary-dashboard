"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Bot, Send, Loader2, LogOut, ArrowLeft, Sparkles } from "lucide-react"
import Markdown from "@/components/agent/markdown"
import clsx from "clsx"

interface AgentMessage {
  role: "user" | "agent"
  content: string
}

export default function PortalAgentPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string
  const [messages, setMessages] = useState<AgentMessage[]>([
    { role: "agent", content: "Hello! I'm your LUMARY assistant. Ask me anything about your projects, payments, or account." },
  ])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [clientName, setClientName] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, streamingContent])

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }, [input])

  // Verify auth and get client name
  useEffect(() => {
    const storedId = sessionStorage.getItem("clientId")
    if (storedId !== clientId) { router.replace("/portal/login"); return }
    fetch(`/api/v1/portal/${clientId}`).then((r) => r.json()).then((d) => setClientName(d.name || "")).catch(() => {})
  }, [clientId, router])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text) return

    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
    setIsStreaming(true)
    setStreamingContent("")

    abortRef.current = new AbortController()

    try {
      const res = await fetch(`/api/v1/portal/${clientId}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) { setIsStreaming(false); return }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No reader")
      const decoder = new TextDecoder()
      let buffer = ""
      let fullResponse = ""

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
              fullResponse += data.data.text
              setStreamingContent((prev) => prev + data.data.text)
            } else if (data.event === "done") {
              const finalContent = data.data.full || fullResponse
              setMessages((prev) => [...prev, { role: "agent", content: finalContent }])
              setStreamingContent("")
              setIsStreaming(false)
              return
            }
          } catch {}
        }
      }
      if (fullResponse) {
        setMessages((prev) => [...prev, { role: "agent", content: fullResponse }])
        setStreamingContent("")
      }
      setIsStreaming(false)
    } catch {
      setIsStreaming(false)
    }
  }, [input, messages, clientId, streamingContent])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleSignOut = () => { sessionStorage.removeItem("clientId"); router.push("/portal/login") }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#fff8f6] to-[#fef4ee]">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/portal/${clientId}`)} className="p-1.5 rounded-lg hover:bg-surface-variant/30 text-on-surface-variant/60 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-on-surface">LUMARY Assistant</h1>
            <p className="text-[10px] text-on-surface-variant/50">{clientName || "Client Portal"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-on-surface-variant/40 bg-outline-variant/20 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> AI Assistant
          </span>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs text-on-surface-variant/70 hover:bg-white hover:text-error transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <div key={idx} className={clsx("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
            <div className={clsx(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
              msg.role === "agent" ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-surface-variant/40 text-on-surface-variant",
            )}>
              {msg.role === "agent" ? <Bot className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full bg-on-surface-variant/50" />}
            </div>
            <div className={clsx(msg.role === "user" ? "max-w-[70%]" : "max-w-[85%]")}>
              <div className={clsx(
                "rounded-2xl px-4 py-3 leading-relaxed",
                msg.role === "agent"
                  ? "bg-white border border-outline-variant/20 shadow-sm text-sm"
                  : "bg-gradient-to-br from-primary to-secondary text-white text-sm",
              )}>
                {msg.role === "agent" ? <Markdown content={msg.content} /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
              </div>
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[85%]">
              <div className="rounded-2xl px-4 py-3 bg-white border border-outline-variant/20 shadow-sm text-sm">
                <Markdown content={streamingContent} />
                <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5 rounded-sm" />
              </div>
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="rounded-2xl px-5 py-3.5 bg-white border border-outline-variant/20 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-xs text-on-surface-variant/50 ml-1">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-outline-variant/20 bg-white/90 backdrop-blur-md px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your projects, payments, or anything..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-surface-variant/10 border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/30 resize-none disabled:opacity-50"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
