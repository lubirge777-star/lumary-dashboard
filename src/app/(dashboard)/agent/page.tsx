"use client"

import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Bot, Send, Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight,
  Sparkles, Loader2, Paperclip, X, FileText, Terminal, Clock,
} from "lucide-react"
import Markdown from "@/components/agent/markdown"
import clsx from "clsx"

interface ChatMessage {
  id?: string
  role: "user" | "agent"
  content: string
  createdAt?: string
}

interface Session {
  id: string
  title: string
  updatedAt: string
  _count: { messages: number }
}

function AgentContent() {
  useEffect(() => { document.title = "Agent — LUMARY Studio" }, [])
  const searchParams = useSearchParams()

  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cronLoading, setCronLoading] = useState(false)
  const [cronResult, setCronResult] = useState<string | null>(null)
  const cronRanRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Auto-run cron on ?tab=cron
  useEffect(() => {
    if (searchParams.get("tab") === "cron" && !cronRanRef.current) {
      cronRanRef.current = true
      runCron()
    }
  }, [searchParams])

  const runCron = async () => {
    setCronLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/v1/agent/cron")
      const data = await res.json()
      setCronResult(data.summary || "Cron completed. No issues found.")
      if (!activeSessionId) {
        setMessages((prev) => [...prev, { role: "agent", content: data.summary || "✅ Daily cron check complete.", createdAt: new Date().toISOString() }])
      }
    } catch {
      setError("Cron check failed")
    } finally {
      setCronLoading(false)
    }
  }

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/agent/sessions")
      setSessions(await res.json())
    } catch {}
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])

  // Load messages for active session
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([])
      return
    }
    fetch(`/api/v1/agent/sessions/${activeSessionId}`)
      .then((r) => r.json())
      .then(setMessages)
  }, [activeSessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  const createSession = async () => {
    const res = await fetch("/api/v1/agent/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    const session = await res.json()
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    setMessages([])
    setError(null)
  }

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch(`/api/v1/agent/sessions?id=${id}`, { method: "DELETE" })
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setMessages([])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else setPreview(null)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text && !selectedFile) return

    let mediaContent = text
    if (selectedFile) {
      const formData = new FormData()
      formData.append("file", selectedFile)
      const uploadRes = await fetch("/api/v1/agent/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      mediaContent = text || `[${selectedFile.type.startsWith("image/") ? "Image" : "File"}: ${uploadData.url}]`
      removeFile()
    }

    // Create session if first message
    let sessionId = activeSessionId
    if (!sessionId) {
      const res = await fetch("/api/v1/agent/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const session = await res.json()
      sessionId = session.id
      setActiveSessionId(session.id)
      setSessions((prev) => [session, ...prev])
    }

    const userMsg: ChatMessage = { role: "user", content: mediaContent, createdAt: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setError(null)
    setIsStreaming(true)
    setStreamingContent("")

    const history = messages.map((m) => ({ role: m.role, content: m.content }))

    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/v1/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: mediaContent, history }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        setError("Failed to reach AI agent. Check your connection.")
        setIsStreaming(false)
        return
      }

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
            } else if (data.event === "done" && data.data?.full) {
              // Use the saved version from server
              setMessages((prev) => [...prev, { role: "agent", content: data.data.full, createdAt: new Date().toISOString() }])
              setStreamingContent("")
              setIsStreaming(false)
              // Reload sessions to get updated title
              loadSessions()
            } else if (data.event === "error") {
              setError(data.data?.message || "Agent error")
              setIsStreaming(false)
              setStreamingContent("")
            } else if (data.data?.text) {
              // Direct SSE format fallback
              setStreamingContent((prev) => prev + data.data.text)
            } else if (data.data?.full) {
              setMessages((prev) => [...prev, { role: "agent", content: data.data.full, createdAt: new Date().toISOString() }])
              setStreamingContent("")
              setIsStreaming(false)
              loadSessions()
            }
          } catch {}
        }
      }

      // If streaming ended but we still have content
      if (streamingContent) {
        setMessages((prev) => [...prev, { role: "agent", content: streamingContent, createdAt: new Date().toISOString() }])
        setStreamingContent("")
      }
      setIsStreaming(false)
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Connection lost. Please try again.")
      }
      setIsStreaming(false)
    }
  }

  // Check if the streaming content should complete
  // This runs after the stream finishes
  useEffect(() => {
    if (!isStreaming && streamingContent && !error) {
      setMessages((prev) => {
        // Avoid duplicate
        if (prev.length > 0 && prev[prev.length - 1].role === "agent" && prev[prev.length - 1].content === streamingContent) {
          return prev
        }
        return [...prev, { role: "agent", content: streamingContent, createdAt: new Date().toISOString() }]
      })
      setStreamingContent("")
    }
  }, [isStreaming])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return d.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-3 md:-mx-container-padding -mt-4 md:-mt-gutter overflow-hidden bg-surface-dim/10">
      {/* Session Sidebar */}
      <div
        className={clsx(
          "flex-shrink-0 border-r border-outline-variant/20 bg-white flex flex-col transition-all duration-300",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden",
        )}
      >
        <div className="p-4 border-b border-outline-variant/10">
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group",
                activeSessionId === s.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-on-surface-variant/80 hover:bg-surface-variant/20 hover:text-on-surface",
              )}
            >
              <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">{s.title}</p>
                <p className="text-[10px] text-on-surface-variant/50 mt-0.5">
                  {s._count.messages} messages · {formatDate(s.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => deleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-error/10 text-on-surface-variant/50 hover:text-error transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-on-surface-variant/20 mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant/50">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-outline-variant/20 bg-white/80 backdrop-blur-md shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-surface-variant/20 text-on-surface-variant/60 transition-all"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-heading font-bold text-on-surface">Agent</h1>
            <p className="text-[10px] text-on-surface-variant/50">
              {isStreaming ? "Generating response..." : activeSessionId ? "Ready" : "Start a conversation"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={runCron}
              disabled={cronLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-variant/20 text-on-surface-variant/60 hover:bg-primary/10 hover:text-primary text-[10px] font-semibold transition-all disabled:opacity-40"
            >
              <Clock className="w-3.5 h-3.5" />
              {cronLoading ? "Scanning..." : "Daily Cron"}
            </button>
            <span className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/40 bg-outline-variant/20 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Gemini
            </span>
          </div>
        </div>

        {/* Cron banner */}
        {cronResult && (
          <div className="shrink-0 mx-4 md:mx-6 mt-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-200/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Daily Cron Report
                </p>
                <div className="text-xs text-on-surface-variant/80 leading-relaxed whitespace-pre-wrap [&_strong]:text-on-surface [&_strong]:font-semibold">
                  {cronResult.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < cronResult.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setCronResult(null)}
                className="p-1 rounded-lg hover:bg-outline-variant/20 text-on-surface-variant/50 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
          {!activeSessionId && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-heading font-bold text-on-surface mb-2">How can I help you?</h2>
              <p className="text-sm text-on-surface-variant/60 max-w-md">
                Ask me to look up clients, create projects, check payments, or analyze your business.
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-lg mt-6 w-full">
                {[
                  { label: "Show recent clients", prompt: "Show me my recent clients" },
                  { label: "Project status", prompt: "What projects are in revision?" },
                  { label: "Pending payments", prompt: "Show pending invoices and amounts" },
                  { label: "Weekly summary", prompt: "Give me a business summary for this week" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => { setInput(action.prompt); inputRef.current?.focus() }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-outline-variant/20 text-xs text-on-surface-variant/70 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={clsx(
                "flex gap-3 max-w-4xl",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "",
              )}
            >
              <div
                className={clsx(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm",
                  msg.role === "agent"
                    ? "bg-gradient-to-br from-primary to-secondary text-white"
                    : "bg-surface-variant/40 text-on-surface-variant",
                )}
              >
                {msg.role === "agent" ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-on-surface-variant/50" />
                )}
              </div>

              <div className={clsx("space-y-1", msg.role === "user" ? "max-w-[70%]" : "max-w-[85%]")}>
                <div
                  className={clsx(
                    "rounded-2xl px-4 py-3 leading-relaxed",
                    msg.role === "agent"
                      ? "bg-white border border-outline-variant/20 shadow-sm"
                      : "bg-gradient-to-br from-primary to-secondary text-white",
                  )}
                >
                  {msg.role === "agent" ? (
                    <Markdown content={msg.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && streamingContent && (
            <div className="flex gap-3 max-w-4xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[85%]">
                <div className="rounded-2xl px-4 py-3 bg-white border border-outline-variant/20 shadow-sm">
                  <Markdown content={streamingContent} />
                  <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5 rounded-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Thinking indicator */}
          {isStreaming && !streamingContent && (
            <div className="flex gap-3 max-w-4xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="rounded-2xl px-5 py-3.5 bg-white border border-outline-variant/20 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-on-surface-variant/50 font-medium">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/5 border border-error/20 text-xs text-error max-w-lg mx-auto">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* File preview */}
        {selectedFile && (
          <div className="px-4 md:px-6 py-2 border-t border-outline-variant/10 bg-surface-variant/5">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-outline-variant/20 max-w-md">
              {preview ? (
                <img src={preview} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-on-surface truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-on-surface-variant/50">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={removeFile} className="p-1 rounded-lg hover:bg-outline-variant/20">
                <X className="w-4 h-4 text-on-surface-variant/50" />
              </button>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="shrink-0 border-t border-outline-variant/20 bg-white/90 backdrop-blur-md px-4 md:px-6 py-3">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className="p-2.5 rounded-xl hover:bg-surface-variant/30 text-on-surface-variant/50 hover:text-primary transition-all shrink-0 disabled:opacity-30"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your business..."
                rows={1}
                disabled={isStreaming}
                className="w-full bg-surface-variant/10 border border-outline-variant/30 rounded-2xl px-4 py-3 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/30 resize-none disabled:opacity-50"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              {isStreaming && (
                <button
                  onClick={() => abortRef.current?.abort()}
                  className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-error/10 text-error text-[10px] font-semibold hover:bg-error/20 transition-all"
                >
                  Stop
                </button>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    }>
      <AgentContent />
    </Suspense>
  )
}
