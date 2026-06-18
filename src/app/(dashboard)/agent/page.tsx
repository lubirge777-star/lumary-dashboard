"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bot, Send, Paperclip, X, Image, FileText, Mic, Video,
  CheckCircle, AlertCircle, Loader2, Sparkles, Command,
} from "lucide-react"
import { useAgentChat, useUploadFile } from "@/lib/api-hooks"
import clsx from "clsx"
import type { AgentMessage } from "@/types"

const quickActions = [
  { label: "New Client", prompt: "Create a new client named..." },
  { label: "Project Status", prompt: "Show me all projects in revision stage" },
  { label: "Weekly Summary", prompt: "Give me a weekly business summary" },
  { label: "Pending Payments", prompt: "Show pending payments and overdue invoices" },
  { label: "Send Message", prompt: "Send a WhatsApp message to..." },
]

export default function AgentPage() {
  useEffect(() => { document.title = "Agent — LUMARY Studio" }, [])

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Hello! I'm your LUMARY Agent. I can help you manage clients, projects, payments, and more. Try asking me to create a client, show project status, or send a message.\n\nTo copy a response for Claude AI review, click the copy button below any message.",
      createdAt: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatMutation = useAgentChat()
  const uploadMutation = useUploadFile()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const copyToClaude = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleSend = async (text?: string) => {
    const content = text || input
    if (!content.trim() && !selectedFile) return

    let mediaUrl: string | undefined
    let mediaType: "image" | "document" | undefined

    if (selectedFile) {
      setIsProcessing(true)
      try {
        const result = await uploadMutation.mutateAsync(selectedFile)
        mediaUrl = result.url
        mediaType = selectedFile.type.startsWith("image/") ? "image" : "document"
      } catch {
        setSelectedFile(null)
        setPreview(null)
        setIsProcessing(false)
        return
      }
      setIsProcessing(false)
    }

    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    removeFile()
    setIsProcessing(true)

    try {
      const history = messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }))

      const res = await chatMutation.mutateAsync({ message: content, history })

      const agentMsg: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: res.reply || "Samahani, siwezi kuchakata ombi lako sasa.",
        createdAt: res.timestamp || new Date().toISOString(),
      }

      setMessages((prev) => [...prev, agentMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: "Sorry, I encountered an error. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mx-3 md:-mx-container-padding -mt-4 md:-mt-gutter">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-outline-variant/20 bg-white/60 backdrop-blur-md shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-heading font-bold text-on-surface">Agent</h1>
          <p className="text-xs text-on-surface-variant/70">AI-powered dashboard assistant</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-on-surface-variant/50 bg-outline-variant/20 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3" /> Powered by Gemini
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "flex gap-3 max-w-3xl",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div
              className={clsx(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1",
                msg.role === "agent"
                  ? "bg-gradient-to-br from-primary to-secondary text-white shadow-md"
                  : "bg-surface-variant/50 text-on-surface-variant"
              )}
            >
              {msg.role === "agent" ? (
                <Bot className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-on-surface-variant/60" />
              )}
            </div>

            {/* Bubble */}
            <div className={clsx("space-y-2 max-w-[85%]", msg.role === "user" ? "items-end" : "")}>
              {msg.mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-outline-variant/20 max-w-sm">
                  {msg.mediaType === "image" ? (
                    <img
                      src={msg.mediaUrl}
                      alt="Uploaded media"
                      className="w-full h-auto max-h-64 object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-surface-variant/20">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-xs text-on-surface-variant truncate">
                        {msg.mediaUrl.split("/").pop()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div
                className={clsx(
                  "rounded-2xl px-4 py-3 whitespace-pre-wrap text-sm leading-relaxed",
                  msg.role === "agent"
                    ? "bg-white border border-outline-variant/20 text-on-surface shadow-sm"
                    : "bg-gradient-to-br from-primary to-secondary text-white"
                )}
              >
                {msg.content}
              </div>

              {/* Actions */}
              {msg.role === "agent" && msg.id !== "welcome" && (
                <div className="flex items-center gap-2 px-1">
                  <button
                    onClick={() => copyToClaude(msg.content)}
                    className="flex items-center gap-1 text-[10px] text-on-surface-variant/50 hover:text-primary transition-colors"
                  >
                    <Sparkles className="w-3 h-3" /> Copy for Claude
                  </button>
                  <span className="text-[10px] text-on-surface-variant/40">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-outline-variant/20 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-on-surface-variant/70">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      {messages.length === 1 && (
        <div className="px-4 md:px-6 pb-3">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  setInput(action.prompt)
                  handleSend(action.prompt)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-outline-variant/20 text-xs text-on-surface-variant/80 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Command className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File preview */}
      {selectedFile && (
        <div className="px-4 md:px-6 py-2 border-t border-outline-variant/10 bg-surface-variant/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-outline-variant/20 max-w-md">
            {preview ? (
              <img src={preview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-on-surface truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-on-surface-variant/60">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button onClick={removeFile} className="p-1 rounded-lg hover:bg-outline-variant/20">
              <X className="w-4 h-4 text-on-surface-variant/60" />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t border-outline-variant/20 bg-white/80 backdrop-blur-md px-4 md:px-6 py-3">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.mp3,.mp4"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl hover:bg-surface-variant/30 text-on-surface-variant/60 hover:text-primary transition-all shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your business..."
              rows={1}
              className="w-full bg-surface-variant/20 border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/30 resize-none max-h-32"
              style={{ minHeight: "44px" }}
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() && !selectedFile}
            className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
