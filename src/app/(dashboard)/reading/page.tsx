"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { BookOpen, Plus, X, Loader2, AlertCircle, RefreshCw, Save, BookMarked, Flame, BookCheck } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const STATUS_COLORS: Record<string, string> = {
  unread: "bg-outline-variant/30 text-on-surface-variant/80",
  reading: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  finished: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
}

interface Book {
  id: string
  title: string
  author: string
  pages: number
  status: string
  createdAt: string
}

interface Session {
  id: string
  bookId: string
  pagesRead: number
  date: string
}

export default function ReadingPage() {
  useEffect(() => { document.title = "Reading — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState(""); const [author, setAuthor] = useState(""); const [pages, setPages] = useState("")
  const [logBookId, setLogBookId] = useState(""); const [logPages, setLogPages] = useState("")

  const { data: booksData, isLoading: booksLoading, error: booksError, refetch } = useQuery({
    queryKey: ["books"], queryFn: () => fetch("/api/v1/books").then((r) => r.json()),
  })
  const { data: sessionsData } = useQuery({
    queryKey: ["reading-sessions"], queryFn: () => fetch("/api/v1/reading-sessions").then((r) => r.json()),
  })
  const books: Book[] = booksData?.items ?? []
  const sessions: Session[] = sessionsData?.items ?? []

  const addBook = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["books"] }); setShowForm(false); setTitle(""); setAuthor(""); setPages(""); toast("success", "Book Added", "New book added to your list") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => fetch(`/api/v1/books?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["books"] }); toast("success", "Status Updated") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
  const logSession = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/reading-sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reading-sessions"] }); setLogBookId(""); setLogPages(""); toast("success", "Session Logged") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const totalPages = books.reduce((s, b) => s + b.pages, 0)
  const readingNow = books.filter((b) => b.status === "reading").length
  const pagesThisWeek = sessions.filter((s) => { const d = new Date(s.date); const weekAgo = Date.now() - 7 * 86400000; return d.getTime() > weekAgo }).reduce((s, sess) => s + sess.pagesRead, 0)
  const streak = (() => { let count = 0; for (let i = 0; i < 365; i++) { const d = new Date(); d.setDate(d.getDate() - i); const dayStr = d.toISOString().slice(0, 10); const has = sessions.some((s) => s.date.slice(0, 10) === dayStr); if (has) count++; else break; } return count })()

  if (booksError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-error" /></div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load books</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-gutter animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-primary" /></div>
          <h2 className="text-headline-lg font-bold text-on-surface">Reading Tracker</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Book"}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-gutter">
        <div className="glass-card p-card-padding flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><BookMarked className="w-6 h-6 text-primary" /></div><div><p className="text-xs text-on-surface-variant/80">Books</p><p className="text-xl font-bold text-on-surface">{books.length}</p></div></div>
        <div className="glass-card p-card-padding flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center"><Flame className="w-6 h-6 text-amber-600" /></div><div><p className="text-xs text-on-surface-variant/80">Reading Streak</p><p className="text-xl font-bold text-on-surface">{streak} {streak === 1 ? "day" : "days"}</p></div></div>
        <div className="glass-card p-card-padding flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><BookCheck className="w-6 h-6 text-emerald-600" /></div><div><p className="text-xs text-on-surface-variant/80">Pages / Week</p><p className="text-xl font-bold text-on-surface">{pagesThisWeek}</p></div></div>
      </div>

      {showForm && (
        <div className="glass-card p-card-padding space-y-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <input type="number" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Total pages" className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <div className="flex justify-end">
            <button onClick={() => addBook.mutate({ title, author, pages: parseInt(pages) })} disabled={!title.trim() || !author.trim() || !pages || addBook.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
              {addBook.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Add Book
            </button>
          </div>
        </div>
      )}

      {/* Log Session */}
      {books.length > 0 && (
        <div className="glass-card p-card-padding space-y-4">
          <h3 className="text-sm font-semibold text-on-surface">Log Reading Session</h3>
          <div className="flex gap-3">
            <select value={logBookId} onChange={(e) => setLogBookId(e.target.value)} className="flex-1 bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
              <option value="">Select book...</option>
              {books.map((b) => (<option key={b.id} value={b.id}>{b.title}</option>))}
            </select>
            <input type="number" value={logPages} onChange={(e) => setLogPages(e.target.value)} placeholder="Pages read" className="w-32 bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            <button onClick={() => logSession.mutate({ bookId: logBookId, pagesRead: parseInt(logPages) })} disabled={!logBookId || !logPages || logSession.isPending} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
              {logSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Log
            </button>
          </div>
        </div>
      )}

      {booksLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="glass-card p-card-padding space-y-3"><div className="h-4 w-32 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-16 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : books.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><BookOpen className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No books yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Add your first book to start tracking your reading</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {books.map((book) => (
            <div key={book.id} className="glass-card p-card-padding card-hover flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", STATUS_COLORS[book.status] || "bg-outline-variant/30 text-on-surface-variant/80")}>{book.status}</span>
                <select value={book.status} onChange={(e) => updateStatus.mutate({ id: book.id, status: e.target.value })} className="text-xs bg-transparent border border-outline-variant/30 rounded-lg px-2 py-1 text-on-surface-variant cursor-pointer">
                  <option value="unread">Unread</option><option value="reading">Reading</option><option value="finished">Finished</option>
                </select>
              </div>
              <h3 className="text-sm font-bold text-on-surface">{book.title}</h3>
              <p className="text-xs text-on-surface-variant/70">{book.author}</p>
              <p className="text-xs text-on-surface-variant/70 mt-2">{book.pages} pages total</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
