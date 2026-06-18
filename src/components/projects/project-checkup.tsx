"use client"

import { useState } from "react"
import {
  ClipboardCheck, Plus, Check, SkipForward, Sparkles,
  Loader2, ChevronDown, ChevronUp,
} from "lucide-react"
import { useProjectCheckups, useCreateCheckup, useAnswerCheckup } from "@/lib/api-hooks"
import type { ProjectCheckup } from "@/types"

const checkupPhases = [
  { value: "inquiry", label: "Inquiry" },
  { value: "quote", label: "Quote" },
  { value: "deposit", label: "Deposit" },
  { value: "production", label: "Production" },
  { value: "revision", label: "Revision" },
  { value: "delivery", label: "Delivery" },
  { value: "followup", label: "Follow-up" },
]

const presetQuestions: Record<string, string[]> = {
  inquiry: [
    "Have we confirmed the client's budget range?",
    "Did we identify the exact service scope?",
    "Has the deadline been communicated clearly?",
  ],
  quote: [
    "Was the quote sent within 24 hours?",
    "Did we include rush fee options?",
    "Has the client acknowledged the quote?",
  ],
  deposit: [
    "Has the deposit been received and confirmed?",
    "Did we send the receipt to the client?",
    "Has the project brief been shared?",
  ],
  production: [
    "Is the project on track for the deadline?",
    "Have we requested all necessary assets from the client?",
    "Has the client approved the concept/direction?",
  ],
  revision: [
    "Are we within the revision limit?",
    "Have all revision requests been documented?",
    "Is the client satisfied with the progress?",
  ],
  delivery: [
    "Has the final file been delivered through the correct channel?",
    "Did we request feedback or a testimonial?",
    "Has the final payment been arranged?",
  ],
  followup: [
    "Has the client been contacted for repeat business?",
    "Did we add them to the retainer pitch list?",
    "Have we recorded the project in the portfolio?",
  ],
}

interface Props {
  projectId: string
  projectPhase?: string
}

export function ProjectCheckup({ projectId, projectPhase }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newQuestion, setNewQuestion] = useState("")
  const [newPhase, setNewPhase] = useState(projectPhase || "general")
  const [answering, setAnswering] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState("")

  const { data: checkups = [], isLoading } = useProjectCheckups(projectId)
  const createCheckup = useCreateCheckup()
  const answerCheckup = useAnswerCheckup()

  const handleAdd = () => {
    if (!newQuestion.trim()) return
    createCheckup.mutate(
      { projectId, phase: newPhase, question: newQuestion.trim() },
      { onSuccess: () => { setNewQuestion(""); setShowAdd(false) } },
    )
  }

  const handleAnswer = (id: string) => {
    if (!answerText.trim()) return
    answerCheckup.mutate(
      { id, answer: answerText.trim() },
      { onSuccess: () => { setAnswering(null); setAnswerText("") } },
    )
  }

  const handleSkip = (id: string) => {
    fetch("/api/v1/projects/checkup", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "skipped" }),
    })
  }

  return (
    <div className="rounded-xl bg-white border border-outline-variant/20 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-variant/10 transition-all"
      >
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-on-surface">Project Check-ups</span>
          <span className="text-[10px] text-on-surface-variant/50 bg-outline-variant/20 px-2 py-0.5 rounded-full">
            {checkups.filter((c: ProjectCheckup) => c.status === "pending").length} pending
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-on-surface-variant/60" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant/60" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          ) : checkups.length === 0 ? (
            <p className="text-xs text-on-surface-variant/60 text-center py-4">
              No check-up questions yet. Add timeline review questions to track progress.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {checkups.map((c: ProjectCheckup) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border ${
                    c.status === "answered"
                      ? "border-emerald-200/50 bg-emerald-50/30"
                      : c.status === "skipped"
                        ? "border-gray-200/50 bg-gray-50/30"
                        : "border-amber-200/50 bg-amber-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
                          {c.phase}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            c.status === "answered"
                              ? "bg-emerald-100 text-emerald-600"
                              : c.status === "skipped"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface leading-relaxed">{c.question}</p>
                      {c.answer && (
                        <div className="mt-2 p-2 rounded-lg bg-white/60 border border-outline-variant/10">
                          <p className="text-xs text-on-surface-variant/80">{c.answer}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => copyToClipboard(c.question + (c.answer ? `\nAnswer: ${c.answer}` : ""))}
                          className="flex items-center gap-1 text-[10px] text-on-surface-variant/50 hover:text-primary transition-colors"
                        >
                          <Sparkles className="w-3 h-3" /> Copy for Claude
                        </button>
                        <span className="text-[10px] text-on-surface-variant/40">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {c.status === "pending" && answering !== c.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => setAnswering(c.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-on-primary text-[10px] font-semibold hover:shadow-md transition-all"
                      >
                        <Check className="w-3 h-3" /> Answer
                      </button>
                      <button
                        onClick={() => handleSkip(c.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-outline-variant/20 text-on-surface-variant text-[10px] font-semibold hover:bg-outline-variant/30 transition-all"
                      >
                        <SkipForward className="w-3 h-3" /> Skip
                      </button>
                    </div>
                  )}

                  {answering === c.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Your answer..."
                        className="flex-1 bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/30"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAnswer(c.id)
                          if (e.key === "Escape") { setAnswering(null); setAnswerText("") }
                        }}
                      />
                      <button
                        onClick={() => handleAnswer(c.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setAnswering(null); setAnswerText("") }}
                        className="px-2.5 py-1.5 rounded-lg bg-outline-variant/20 text-on-surface-variant text-[10px] font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add question */}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add check-up question
          </button>

          {showAdd && (
            <div className="space-y-2 p-3 rounded-xl bg-surface-variant/10 border border-outline-variant/20">
              <select
                value={newPhase}
                onChange={(e) => setNewPhase(e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/30"
              >
                <option value="general">General</option>
                {checkupPhases.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              <div className="flex flex-wrap gap-1.5">
                {(presetQuestions[newPhase] || []).map((q) => (
                  <button
                    key={q}
                    onClick={() => setNewQuestion(q)}
                    className="text-[10px] px-2 py-1 rounded-full bg-white border border-outline-variant/20 text-on-surface-variant/70 hover:border-primary/30 hover:text-primary transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type a custom question..."
                rows={2}
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/30 resize-none"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newQuestion.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[10px] font-semibold hover:shadow-md transition-all disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-3 py-1.5 rounded-lg bg-outline-variant/20 text-on-surface-variant text-[10px] font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}
