"use client"

import { useState, useMemo, useRef, useEffect, useDeferredValue } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useClients } from "@/lib/api-hooks"
import { formatRelativeDate } from "@/lib/utils"
import type { Message, Client, InboxThread } from "@/types"
import { Search, Phone, Send, Check, CheckCheck, ChevronLeft, Sparkles, Bot, Loader2 } from "lucide-react"

export default function MessagesPage() {
  useEffect(() => { document.title = "Messages — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const { data: clientsData } = useClients()
  const clients = ((clientsData as any)?.items ?? []) as Client[]
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [messageText, setMessageText] = useState("")
  const [sending, setSending] = useState(false)
  const [showAiPanel, setShowAiPanel] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [showMobileList, setShowMobileList] = useState(true)

  const { data: inboxThreads = [], isLoading: inboxLoading, error: inboxError } = useQuery({
    queryKey: ["inbox"],
    queryFn: () => fetch("/api/v1/inbox").then((r) => r.json()),
  })

  const { data: aiAnalysis } = useQuery({
    queryKey: ["ai-analyze", selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return null
      const lastMsg = conversation[conversation.length - 1]
      if (!lastMsg || lastMsg.direction !== "inbound") return null
      const res = await fetch("/api/v1/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", text: lastMsg.content, clientName: selectedClient.name }),
      })
      return res.json()
    },
    enabled: !!selectedClient,
  })

  const filteredClients = useMemo(() => {
    if (!deferredSearch) return clients
    const q = deferredSearch.toLowerCase()
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.whatsappNumber.includes(q))
  }, [clients, deferredSearch])

  const currentThread = inboxThreads.find((t: any) => t.clientId === selectedClient?.id) as InboxThread | undefined
  const conversation = currentThread?.messages ?? []

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedClient, conversation])

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/v1/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedClient?.whatsappNumber, message: content, clientId: selectedClient?.id }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] })
    },
  })

  const handleSend = () => {
    if (!messageText.trim() || !selectedClient) return
    sendMutation.mutate(messageText.trim())
    setMessageText("")
  }

  const selectClient = (client: Client) => {
    setSelectedClient(client)
    setShowMobileList(false)
    setShowAiPanel(false)
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] -mx-6 -mt-6">
      {/* Sidebar */}
      <div className={`w-80 border-r border-outline-variant/50 flex flex-col bg-surface-container-low/80 backdrop-blur-sm ${showMobileList ? "flex" : "hidden md:flex"} md:flex`}>
        <div className="p-4 border-b border-outline-variant/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-on-surface">Messages</h2>
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`p-1.5 rounded-lg transition-all ${showAiPanel ? "bg-primary/10 text-primary" : "text-on-surface-variant/80 hover:bg-outline-variant/30"}`}
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/80" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-xl pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/80 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(212,168,83,0.06)] transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30">
          {inboxLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : inboxError ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <p className="text-xs text-on-surface-variant/80">Failed to load messages</p>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["inbox"] })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
              >
                Retry
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-xs text-on-surface-variant/80">No clients found</p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const thread = inboxThreads.find((t: any) => t.clientId === client.id)
              return (
                <button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-white/60 dark:hover:bg-surface-container-high/60 transition-all ${
                    selectedClient?.id === client.id ? "bg-white dark:bg-surface-container-high border-l-[3px] border-primary" : "border-l-[3px] border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                        {client.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface-container-low" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-on-surface truncate">{client.name}</p>
                      <p className="text-xs text-on-surface-variant/80 truncate mt-0.5">
                        {thread ? (
                          <>
                            {thread.lastMessage}
                          </>
                        ) : client.whatsappNumber}
                      </p>
                    </div>
                    {thread && (
                      <span className="text-[10px] text-on-surface-variant/80 whitespace-nowrap">
                        {formatRelativeDate(new Date(thread.lastMessageAt))}
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!showMobileList ? "flex" : "hidden md:flex"} md:flex`}>
        {selectedClient ? (
          <>
            <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center gap-3 bg-surface-container-low/60 backdrop-blur-sm">
              <button className="md:hidden mr-1 text-on-surface-variant hover:text-on-surface" onClick={() => setShowMobileList(true)}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                {selectedClient.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">{selectedClient.name}</p>
                <p className="text-xs text-on-surface-variant/80">{selectedClient.whatsappNumber}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {showAiPanel && aiAnalysis && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    {aiAnalysis.intent}
                  </div>
                )}
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600">Online</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-1.5 bg-white dark:bg-surface-container">
              {conversation.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-on-surface-variant/80">No messages yet. Start a conversation!</p>
                </div>
              ) : (
                conversation.map((msg: Message, i: number) => {
                  const prevMsg = i > 0 ? conversation[i - 1] : null
                  const isSameSender = prevMsg?.direction === msg.direction
                  return (
                    <div key={msg.id} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"} ${isSameSender ? "mt-0.5" : "mt-3"}`}>
                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-sm relative ${
                          msg.direction === "outbound"
                            ? "bg-gradient-to-br from-primary to-primary text-on-primary rounded-br-md"
                            : "bg-white border border-outline-variant text-on-surface rounded-bl-md"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.content}</p>
                        <div className={`flex items-center gap-1 justify-end mt-0.5 ${
                          msg.direction === "outbound" ? "text-on-primary/60" : "text-on-surface-variant/80"
                        }`}>
                          <span className="text-[10px]">{formatRelativeDate(new Date(msg.createdAt))}</span>
                          {msg.direction === "outbound" && (
                            <CheckCheck className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              {aiAnalysis && showAiPanel && (
                <div className="flex justify-start mt-4">
                  <div className="max-w-md rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3 text-sm rounded-bl-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">AI Suggestion</span>
                    </div>
                    <p className="text-on-surface/80 leading-relaxed text-sm">{aiAnalysis.suggestedReply}</p>
                    <button
                      onClick={() => {
                        setMessageText(aiAnalysis.suggestedReply)
                      }}
                      className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                    >
                      <Send className="w-3 h-3" />
                      Use this reply
                    </button>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-outline-variant/50 bg-surface-container-low/80 backdrop-blur-sm">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={aiAnalysis?.suggestedReply ? "AI suggested reply ready..." : "Type a message..."}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1 bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/80 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(212,168,83,0.06)] transition-all"
                />
                <button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    showAiPanel ? "bg-primary/10 text-primary" : "bg-outline-variant/30 text-on-surface-variant/80 hover:bg-outline-variant/50"
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sending}
                  className="px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface-container">
            <div className="text-center space-y-4 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mx-auto">
                <Phone className="w-10 h-10 text-on-surface-variant/80" />
              </div>
              <div>
                <p className="text-on-surface font-medium">Your Messages</p>
                <p className="text-on-surface-variant/80 text-sm mt-1">Select a client to start chatting</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
