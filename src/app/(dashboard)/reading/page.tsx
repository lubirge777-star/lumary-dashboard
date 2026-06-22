"use client"

import { useEffect, useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { BookOpen, Plus, X, Loader2, AlertCircle, RefreshCw, Save, BookMarked, Flame, BookCheck, ArrowRight, Check, Clock } from "lucide-react"
import clsx from "clsx"
import { useToast } from "@/components/ui/toast"

const STATUS_COLORS: Record<string, string> = {
  unread: "bg-outline-variant/30 text-on-surface-variant/80",
  reading: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  finished: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
}

interface Book {
  id: string; title: string; author: string; pages: number; status: string; notes?: string; startedAt?: string; finishedAt?: string; createdAt: string
}

interface Session {
  id: string; bookId: string; pagesRead: number; date: string
}

const QUEUE_BOOKS = [
  { title: "Atomic Habits", author: "James Clear", pages: 320, notes: "Build the discipline system behind everything. 20 min/day, 32 days." },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", pages: 381, notes: "Sharpen your mindset. Think long-term. 20 min/day, 45 days." },
  { title: "How to Win Friends and Influence People", author: "Dale Carnegie", pages: 288, notes: "People skills = wealth skills. 20 min/day, 30 days." },
  { title: "The Lean Startup", author: "Eric Ries", pages: 336, notes: "Build products people actually want. 20 min/day, 35 days." },
  { title: "The Alchemist", author: "Paulo Coelho", pages: 197, notes: "Inspiration when you need it. 20 min/day, 20 days." },
]

export default function ReadingPage() {
  useEffect(() => {
    document.title = "Reading — LUMARY Studio"
    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  }, [])
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [showSeedConfirm, setShowSeedConfirm] = useState(false)
  const [title, setTitle] = useState(""); const [author, setAuthor] = useState(""); const [pages, setPages] = useState("")
  const [logBookId, setLogBookId] = useState(""); const [logPages, setLogPages] = useState("10")

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const { data: booksData, isLoading: booksLoading, error: booksError, refetch } = useQuery({
    queryKey: ["books"], queryFn: () => fetch("/api/v1/books").then((r) => r.json()),
  })
  const { data: sessionsData } = useQuery({
    queryKey: ["reading-sessions"], queryFn: () => fetch("/api/v1/reading-sessions").then((r) => r.json()),
  })
  const books: Book[] = booksData?.items ?? []
  const sessions: Session[] = sessionsData?.items ?? []

  const readingNow = books.find((b) => b.status === "reading")
  const queue = books.filter((b) => b.status === "unread")
  const finished = books.filter((b) => b.status === "finished")

  const addBook = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["books"] }); setShowForm(false); setTitle(""); setAuthor(""); setPages(""); toast("success", "Book Added") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
  const updateStatus = useMutation({
    mutationFn: ({ id, status, ...rest }: any) => fetch(`/api/v1/books?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, ...rest }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["books"] }); toast("success", "Status Updated") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
  const logSession = useMutation({
    mutationFn: (body: object) => fetch("/api/v1/reading-sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reading-sessions"] }); setLogBookId(""); setLogPages("10"); toast("success", "Session Logged") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
  const seedQueue = useMutation({
    mutationFn: () => Promise.all(QUEUE_BOOKS.map((b: any) => fetch("/api/v1/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, status: b === QUEUE_BOOKS[0] ? "reading" : "unread" }) }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() }))),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["books"] }); setShowSeedConfirm(false); toast("success", "Reading Queue Seeded!") },
  })

  const totalPages = books.reduce((s, b) => s + b.pages, 0)
  const readingCount = books.filter((b) => b.status === "reading").length
  const pagesThisWeek = sessions.filter((s) => { const d = new Date(s.date); const weekAgo = Date.now() - 7 * 86400000; return d.getTime() > weekAgo }).reduce((s, sess) => s + sess.pagesRead, 0)
  const streak = (() => { let count = 0; for (let i = 0; i < 365; i++) { const d = new Date(); d.setDate(d.getDate() - i); const has = sessions.some((s) => s.date.slice(0, 10) === d.toISOString().slice(0, 10)); if (has) count++; else break; } return count })()

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
        <div className="flex items-center gap-2">
          {books.length === 0 && (
            <button onClick={() => setShowSeedConfirm(true)} disabled={seedQueue.isPending} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all">
              {seedQueue.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookMarked className="w-4 h-4" />}Seed Queue
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Book"}
          </button>
        </div>
      </div>

      {/* Seed Confirmation */}
      {showSeedConfirm && (
        <div className="glass-card p-card-padding border-l-4 border-l-emerald-500">
          <p className="text-sm text-on-surface mb-3">This will seed the 5-book reading queue from the LUMARY timetable: Atomic Habits → 7 Habits → How to Win Friends → Lean Startup → The Alchemist</p>
          <div className="flex gap-2">
            <button onClick={() => seedQueue.mutate()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all"><Check className="w-4 h-4" /> Yes, Seed</button>
            <button onClick={() => setShowSeedConfirm(false)} className="px-4 py-2 rounded-xl bg-surface-container-highest text-on-surface text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-gutter">
        <div className="glass-card p-card-padding flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><BookMarked className="w-6 h-6 text-primary" /></div><div><p className="text-xs text-on-surface-variant/80">Books</p><p className="text-xl font-bold text-on-surface">{books.length}</p></div></div>
        <div className="glass-card p-card-padding flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center"><Flame className="w-6 h-6 text-amber-600" /></div><div><p className="text-xs text-on-surface-variant/80">Reading Streak</p><p className="text-xl font-bold text-on-surface">{streak} {streak === 1 ? "day" : "days"}</p></div></div>
        <div className="glass-card p-card-padding flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><BookCheck className="w-6 h-6 text-emerald-600" /></div><div><p className="text-xs text-on-surface-variant/80">Pages / Week</p><p className="text-xl font-bold text-on-surface">{pagesThisWeek}</p></div></div>
      </div>

      {/* Currently Reading */}
      {readingNow && (
        <div className="glass-card p-card-padding border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-on-surface-variant/70 uppercase tracking-wider font-semibold">Currently Reading</p>
            <button onClick={() => {
              updateStatus.mutate({ id: readingNow.id, status: "finished", finishedAt: new Date().toISOString() })
              const nextUnread = queue[0]
              if (nextUnread) {
                const t = setTimeout(() => updateStatus.mutate({ id: nextUnread.id, status: "reading", startedAt: new Date().toISOString() }), 200)
                timersRef.current.push(t)
              }
            }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all">
              <Check className="w-3.5 h-3.5" /> Finish & Next
            </button>
          </div>
          <h3 className="text-base font-bold text-on-surface">{readingNow.title}</h3>
          <p className="text-xs text-on-surface-variant/70">{readingNow.author} · {readingNow.pages} pages</p>
          {readingNow.notes && <p className="text-xs text-on-surface-variant/60 mt-2">{readingNow.notes}</p>}
        </div>
      )}

      {/* Reading Queue */}
      {queue.length > 0 && (
        <div className="glass-card p-card-padding">
          <h3 className="text-sm font-semibold text-on-surface mb-3">Reading Queue</h3>
          <div className="space-y-2">
            {queue.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-highest/30">
                <div className="w-6 h-6 rounded-lg bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface-variant/70">{i + 1}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{b.title}</p>
                  <p className="text-xs text-on-surface-variant/70">{b.author}</p>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-surface-container-highest text-on-surface-variant">{b.pages}p</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Session */}
      {books.length > 0 && (
        <div className="glass-card p-card-padding space-y-4">
          <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Log Reading Session</h3>
          <div className="flex gap-3">
            <select value={logBookId} onChange={(e) => setLogBookId(e.target.value)} className="flex-1 bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary">
              <option value="">Select book...</option>
              {books.filter((b) => b.status !== "finished").map((b) => (<option key={b.id} value={b.id}>{b.title}</option>))}
            </select>
            <input type="number" value={logPages} onChange={(e) => setLogPages(e.target.value)} placeholder="Pages" className="w-24 bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary" />
            <button onClick={() => logSession.mutate({ bookId: logBookId, pagesRead: parseInt(logPages) })} disabled={!logBookId || !logPages || logSession.isPending} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all disabled:opacity-40">
              {logSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Log
            </button>
          </div>
        </div>
      )}

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

      {booksLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="glass-card p-card-padding space-y-3"><div className="h-4 w-32 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /><div className="h-3 w-16 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" /></div>))}
        </div>
      ) : books.length === 0 ? (
        <div className="glass-card p-card-padding flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mb-5"><BookOpen className="w-7 h-7 text-on-surface-variant/80" /></div>
          <h3 className="text-base font-semibold text-on-surface mb-1.5">No books yet</h3>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">Seed the reading queue or add your first book</p>
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
              <p className="text-xs text-on-surface-variant/70 mt-1">{book.pages} pages total</p>
              {book.notes && <p className="text-xs text-on-surface-variant/60 mt-2 leading-relaxed">{book.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
