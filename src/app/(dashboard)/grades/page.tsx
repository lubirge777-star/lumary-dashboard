"use client"

import { useEffect, useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  GraduationCap, Calculator, TrendingUp, Loader2, AlertCircle, RefreshCw,
  BookOpen, PenTool,
} from "lucide-react"
import { DIT_COURSES } from "@/lib/v7-data/courses"
import clsx from "clsx"

interface GradeRow {
  code: string
  title: string
  instructor: string
  assignment: number
  midterm: number
  exam: number
  targetExam: number | null
}

export default function GradesPage() {
  useEffect(() => { document.title = "Grades — LUMARY Studio" }, [])
  const queryClient = useQueryClient()

  const { data: gradesResp, isLoading, error, refetch } = useQuery({
    queryKey: ["grades"],
    queryFn: () => fetch("/api/v1/grades").then((r) => r.json()),
  })

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch("/api/v1/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] })
    },
  })

  const [edits, setEdits] = useState<Record<string, Partial<Record<string, number | null>>>>({})

  const apiGrades: Record<string, unknown>[] = gradesResp?.items ?? []

  const courses = useMemo(() => {
    const gradesByCode = new Map(apiGrades.map((g: Record<string, unknown>) => [g.courseCode, g]))
    return DIT_COURSES.map((c): GradeRow => {
      const s = gradesByCode.get(c.code) as Record<string, unknown> | undefined
      const e = edits[c.code] || {}
      return {
        code: c.code,
        title: c.title,
        instructor: c.instructor,
        assignment: (e.assignment as number) ?? (s?.assignment as number) ?? 0,
        midterm: (e.midterm as number) ?? (s?.midterm as number) ?? 0,
        exam: (e.exam as number) ?? (s?.exam as number) ?? 0,
        targetExam: e.targetExam !== undefined ? (e.targetExam as number | null) : ((s?.targetExam as number | null) ?? null),
      }
    })
  }, [apiGrades, edits])

  const getTotal = (g: GradeRow) => Math.min(g.assignment + g.midterm + g.exam, 100)

  const currentGPA = courses.length
    ? courses.reduce((s, g) => s + getTotal(g), 0) / courses.length / 20
    : 0

  const predictedGPA = courses.length
    ? courses.reduce((s, g) => {
        const exam = g.targetExam != null ? Math.min(g.targetExam, 100) : g.exam
        return s + Math.min(g.assignment + g.midterm + exam, 100)
      }, 0) / courses.length / 20
    : 0

  const clamp = (v: string) => {
    if (v === "") return 0
    return Math.min(100, Math.max(0, Number(v) || 0))
  }

  const handleChange = (code: string, field: string, raw: string) => {
    const num = field === "targetExam" ? (raw === "" ? null : clamp(raw)) : clamp(raw)
    setEdits((prev) => ({
      ...prev,
      [code]: { ...prev[code], [field]: num },
    }))
  }

  const handleSave = (code: string) => {
    const grade = courses.find((c) => c.code === code)
    if (!grade) return
    const total = getTotal(grade)
    saveMutation.mutate({
      courseCode: code,
      courseName: grade.title,
      instructor: grade.instructor,
      assignment: grade.assignment,
      midterm: grade.midterm,
      exam: grade.exam,
      targetExam: grade.targetExam,
      total,
      semester: "2025/2026",
    })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load grades</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-card-padding space-y-4">
              <div className="h-4 w-24 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
              <div className="h-8 w-20 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
            </div>
          ))}
        </div>
        <div className="glass-card p-card-padding">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                  <div key={j} className="h-5 flex-1 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-on-surface">DIT Academic Tracker</h1>
        <p className="text-sm text-on-surface-variant/80 mt-1">
          Track your grades for the 2025/2026 academic year
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Current GPA", value: currentGPA.toFixed(2), icon: GraduationCap, accent: "bg-primary/10 text-primary", gradient: "grad-orange" },
          { label: "Predicted GPA", value: predictedGPA.toFixed(2), icon: TrendingUp, accent: "bg-secondary/10 text-secondary", gradient: "grad-blue" },
          { label: "Courses", value: courses.length.toString(), icon: BookOpen, accent: "bg-tertiary/10 text-tertiary", gradient: "grad-purple" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-card p-card-padding flex items-center gap-4 card-hover relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.gradient} rounded-full opacity-10 blur-2xl`} />
              <div className={`w-12 h-12 rounded-2xl ${stat.accent} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <p className="text-xs text-on-surface-variant/80 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className={clsx("text-2xl font-bold font-heading mt-1", stat.accent.split(" ")[1])}>{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-card-padding pt-card-padding pb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2">
            <PenTool className="w-4 h-4 text-primary" />
            Grade Entry
          </h3>
          {saveMutation.isPending && (
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 px-4">Code</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 px-4">Course</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 px-4">Instructor</th>
                <th className="text-center text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 px-2">Assignment</th>
                <th className="text-center text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 px-2">Midterm</th>
                <th className="text-center text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 px-2">Exam</th>
                <th className="text-center text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 px-2">Total</th>
                <th className="text-center text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider pb-3 px-2">Target Exam</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((g, i) => {
                const total = getTotal(g)
                const totalColor = total >= 70 ? "text-emerald-600" : total >= 50 ? "text-amber-600" : "text-error"
                return (
                  <tr key={g.code} className="border-b border-outline-variant/10 hover:bg-black/[0.02] transition-all animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="py-3 px-4 font-mono text-xs text-on-surface-variant/70">{g.code}</td>
                    <td className="py-3 px-4 font-medium text-on-surface">{g.title}</td>
                    <td className="py-3 px-4 text-on-surface-variant/70">{g.instructor}</td>
                    {(["assignment", "midterm", "exam"] as const).map((field) => (
                      <td key={field} className="py-3 px-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={g[field]}
                          onChange={(e) => handleChange(g.code, field, e.target.value)}
                          onBlur={() => handleSave(g.code)}
                          className="w-16 text-center bg-white dark:bg-surface-container-low border border-outline-variant/40 rounded-lg px-2 py-1.5 text-sm text-on-surface font-mono focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
                        />
                      </td>
                    ))}
                    <td className="py-3 px-2 text-center">
                      <span className={clsx("font-mono font-semibold text-base", totalColor)}>
                        {total}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={g.targetExam ?? ""}
                        onChange={(e) => handleChange(g.code, "targetExam", e.target.value)}
                        onBlur={() => handleSave(g.code)}
                        placeholder="&mdash;"
                        className="w-16 text-center bg-white dark:bg-surface-container-low border border-outline-variant/40 rounded-lg px-2 py-1.5 text-sm text-on-surface font-mono placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-card-padding">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-primary" />
            GPA Calculation
          </h3>
          <div className="space-y-2 text-sm text-on-surface-variant/70">
            <p>Each course total = Assignment + Midterm + Exam (max 100)</p>
            <p>GPA = Average of all totals &divide; 20 (scaled to 5.0)</p>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/10">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-on-surface">Current GPA</span>
              <span className="text-2xl font-bold font-heading text-primary">{currentGPA.toFixed(2)}</span>
            </div>
            <div className="border-t border-primary/10 my-2" />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-on-surface">Predicted GPA</span>
              <span className="text-2xl font-bold font-heading text-secondary">{predictedGPA.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-card-padding">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            Grade Distribution
          </h3>
          <div className="space-y-3">
            {courses.map((g) => {
              const total = getTotal(g)
              const barColor = total >= 70 ? "bg-emerald-500" : total >= 50 ? "bg-amber-500" : "bg-red-500"
              return (
                <div key={g.code} className="flex items-center gap-3">
                  <span className="text-xs text-on-surface-variant/80 w-8 shrink-0 font-mono">{g.code.slice(-5)}</span>
                  <div className="flex-1 h-3 rounded-full bg-surface-variant/50 overflow-hidden">
                    <div
                      className={clsx("h-full rounded-full transition-all duration-700", barColor)}
                      style={{ width: `${total}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold text-on-surface-variant/80 w-10 text-right">{total}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
