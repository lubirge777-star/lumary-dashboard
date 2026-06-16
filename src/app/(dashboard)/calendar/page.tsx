"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, parseISO, isWithinInterval, startOfDay, endOfDay,
} from "date-fns"
import {
  ChevronLeft, ChevronRight, Plus, X, Clock,
  Trash2, Save, Sun, CalendarDays, Loader2, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from "@/lib/api-hooks"
import type { Appointment, AppointmentFormData } from "@/types"

const COLORS = [
  { value: "#9d4319", label: "Primary" },
  { value: "#00629f", label: "Secondary" },
  { value: "#7e35ca", label: "Tertiary" },
  { value: "#43E97B", label: "Green" },
  { value: "#FF6B6B", label: "Red" },
  { value: "#4FACFE", label: "Blue" },
  { value: "#FF8E5E", label: "Orange" },
  { value: "#C896FF", label: "Purple" },
  { value: "#FFD700", label: "Gold" },
  { value: "#2ecc71", label: "Emerald" },
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type ViewMode = "month" | "day"

export default function CalendarPage() {
  useEffect(() => { document.title = "Calendar — LUMARY Studio" }, [])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("month")

  const appointmentsQuery = useAppointments()
  const appointments: Appointment[] = (appointmentsQuery.data ?? []) as Appointment[]
  const appointmentsLoading = appointmentsQuery.isLoading
  const appointmentsError = appointmentsQuery.error
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()
  const deleteAppointment = useDeleteAppointment()
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => fetch("/api/v1/clients").then((r) => r.json()).then((d: any) => d.items ?? []),
  })

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const gridStart = startOfWeek(monthStart)
    const gridEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [currentMonth])

  const dayAppointments = useMemo(() => {
    if (!selectedDate) return []
    const dayStart = startOfDay(selectedDate)
    const dayEnd = endOfDay(selectedDate)
    return appointments.filter((a) => {
      const start = parseISO(a.startTime)
      const end = a.endTime ? parseISO(a.endTime) : start
      return start <= dayEnd && end >= dayStart
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [appointments, selectedDate])

  const getDayAppointments = (day: Date) => {
    return appointments.filter((a) => {
      const start = parseISO(a.startTime)
      if (a.allDay) return isSameDay(start, day)
      const end = a.endTime ? parseISO(a.endTime) : start
      return isWithinInterval(day, { start: startOfDay(start), end: endOfDay(end) }) ||
        isSameDay(start, day) || isSameDay(end, day) ||
        (start < startOfDay(day) && end > endOfDay(day))
    })
  }

  if (appointmentsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load calendar</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
          <button onClick={() => appointmentsQuery.refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">Retry</button>
        </div>
      </div>
    )
  }

  if (appointmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-gutter h-[calc(100vh-8rem)]">
      <div className={cn("flex-1 flex flex-col glass-card p-card-padding overflow-hidden", selectedDate && "lg:flex-1")}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-10 h-10 rounded-xl border border-outline-variant/50 flex items-center justify-center hover:bg-surface-variant/50 transition-colors text-on-surface"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-headline-md font-bold text-on-surface min-w-[200px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-10 h-10 rounded-xl border border-outline-variant/50 flex items-center justify-center hover:bg-surface-variant/50 transition-colors text-on-surface"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()) }}
              className="px-4 h-10 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-outline-variant/30 overflow-hidden">
              <button
                onClick={() => setViewMode("month")}
                className={cn("px-4 h-10 text-sm font-medium transition-colors", viewMode === "month" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-variant/50")}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("day")}
                className={cn("px-4 h-10 text-sm font-medium transition-colors", viewMode === "day" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-variant/50")}
              >
                Day
              </button>
            </div>
            <button
              onClick={() => { setEditingAppointment(null); setShowNewModal(true) }}
              className="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Appointment</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-outline-variant/20 mb-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2 text-center text-label-bold text-on-surface-variant uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((day, idx) => {
            const dayApps = getDayAppointments(day)
            const isSel = selectedDate && isSameDay(day, selectedDate)
            const isCurrMonth = isSameMonth(day, currentMonth)
            return (
              <button
                key={idx}
                onClick={() => { setSelectedDate(day); setViewMode("day") }}
                className={cn(
                  "border border-outline-variant/10 p-1.5 flex flex-col items-start gap-0.5 transition-colors text-left min-h-[80px] sm:min-h-[100px] group hover:bg-surface-container-low/70 relative",
                  !isCurrMonth && "opacity-40",
                  isSel && "bg-primary/5 ring-1 ring-primary/30"
                )}
              >
                <span className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium",
                  isToday(day) && "bg-primary text-on-primary font-bold",
                  isSel && !isToday(day) && "bg-primary/10 text-primary",
                  !isToday(day) && "text-on-surface"
                )}>
                  {format(day, "d")}
                </span>
                <div className="flex flex-wrap gap-0.5 mt-0.5 w-full">
                  {dayApps.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: app.color || "#9d4319" }}
                      title={app.title}
                    />
                  ))}
                  {dayApps.length > 3 && (
                    <span className="text-[10px] font-semibold text-on-surface-variant/80 px-1">
                      +{dayApps.length - 3}
                    </span>
                  )}
                </div>
                {dayApps.length > 0 && (
                  <div className="hidden lg:flex flex-col gap-0.5 mt-0.5 w-full">
                    {dayApps.slice(0, 2).map((app) => (
                      <div
                        key={app.id}
                        className="text-[11px] leading-tight truncate rounded px-1 py-0.5 font-medium"
                        style={{ backgroundColor: `${app.color || "#9d4319"}18`, color: app.color || "#9d4319" }}
                      >
                        {!app.allDay && format(parseISO(app.startTime), "h:mm a")}{" "}
                        {app.title}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && viewMode === "day" && (
        <div className="w-full lg:w-96 glass-card p-card-padding flex flex-col animate-slideInRight shrink-0 max-h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-headline-md font-bold text-on-surface">
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              <p className="text-sm text-on-surface-variant/70">
                {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button onClick={() => setSelectedDate(null)} className="w-8 h-8 rounded-lg hover:bg-surface-variant/50 flex items-center justify-center text-on-surface-variant">
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => { setEditingAppointment(null); setShowNewModal(true) }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-outline-variant/40 text-on-surface-variant text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors mb-4"
          >
            <Plus className="w-4 h-4" /> Add Appointment
          </button>

          <div className="flex-1 overflow-y-auto space-y-3">
            {dayAppointments.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant/70">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No appointments for this day</p>
              </div>
            )}
            {dayAppointments.map((app) => (
              <button
                key={app.id}
                onClick={() => { setEditingAppointment(app); setShowNewModal(true) }}
                className="w-full text-left p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-low/50 transition-all group"
                style={{ borderLeftColor: app.color || "#9d4319", borderLeftWidth: 4 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-on-surface truncate">{app.title}</h4>
                    {app.description && (
                      <p className="text-sm text-on-surface-variant/70 mt-1 line-clamp-2">{app.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant/80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {app.allDay ? "All day" : `${format(parseISO(app.startTime), "h:mm a")}${app.endTime ? ` - ${format(parseISO(app.endTime), "h:mm a")}` : ""}`}
                      </span>
                      {app.status !== "scheduled" && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          app.status === "completed" ? "bg-green-100 text-green-700" :
                          app.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-orange-100 text-orange-700"
                        )}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Cancel "${app.title}"?`)) {
                        deleteAppointment.mutate({ id: app.id, title: app.title })
                      }
                    }}
                    className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-error/10 text-error transition-all flex items-center justify-center shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showNewModal && (
        <AppointmentModal
          appointment={editingAppointment}
          clients={(clients as any[]) || []}
          onClose={() => { setShowNewModal(false); setEditingAppointment(null) }}
          onSave={(data) => {
            if (editingAppointment) {
              updateAppointment.mutate({ id: editingAppointment.id, data }, {
                onSuccess: () => { setShowNewModal(false); setEditingAppointment(null) }
              })
            } else {
              createAppointment.mutate(data, {
                onSuccess: () => { setShowNewModal(false); setEditingAppointment(null) }
              })
            }
          }}
          onDelete={editingAppointment ? () => {
            if (confirm(`Cancel "${editingAppointment.title}"?`)) {
              deleteAppointment.mutate({ id: editingAppointment.id, title: editingAppointment.title }, {
                onSuccess: () => { setShowNewModal(false); setEditingAppointment(null) }
              })
            }
          } : undefined}
        />
      )}
    </div>
  )
}

function AppointmentModal({
  appointment, clients, onClose, onSave, onDelete,
}: {
  appointment: Appointment | null
  clients: { id: string; name: string; whatsappNumber: string }[]
  onClose: () => void
  onSave: (data: AppointmentFormData) => void
  onDelete?: () => void
}) {
  const [title, setTitle] = useState(appointment?.title || "")
  const [description, setDescription] = useState(appointment?.description || "")
  const [startTime, setStartTime] = useState(
    appointment ? format(parseISO(appointment.startTime), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [endTime, setEndTime] = useState(
    appointment?.endTime ? format(parseISO(appointment.endTime), "yyyy-MM-dd'T'HH:mm") : ""
  )
  const [allDay, setAllDay] = useState(appointment?.allDay || false)
  const [color, setColor] = useState(appointment?.color || "#9d4319")
  const [clientId, setClientId] = useState(appointment?.clientId || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: allDay ? format(new Date(startTime), "yyyy-MM-dd") + "T00:00:00" : new Date(startTime).toISOString(),
      endTime: endTime ? (allDay ? format(new Date(endTime), "yyyy-MM-dd") + "T23:59:00" : new Date(endTime).toISOString()) : undefined,
      allDay,
      color: color || undefined,
      clientId: clientId || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="glass-card w-full max-w-lg p-6 animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-headline-md font-bold text-on-surface">
            {appointment ? "Edit Appointment" : "New Appointment"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-variant/50 flex items-center justify-center text-on-surface-variant">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Appointment title"
              required
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>

          <div>
            <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <span className="text-sm text-on-surface font-medium flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-on-surface-variant/80" />
              All day
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">
                Start {allDay ? "Date" : "Date & Time"} *
              </label>
              <input
                type={allDay ? "date" : "datetime-local"}
                value={allDay ? startTime.slice(0, 10) : startTime}
                onChange={(e) => setStartTime(allDay ? e.target.value + "T00:00" : e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
            <div>
              <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">
                End {allDay ? "Date" : "Date & Time"}
              </label>
              <input
                type={allDay ? "date" : "datetime-local"}
                value={allDay ? (endTime ? endTime.slice(0, 10) : "") : endTime}
                onChange={(e) => setEndTime(allDay ? (e.target.value ? e.target.value + "T23:59" : "") : e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-9 h-9 rounded-xl transition-all border-2",
                    color === c.value ? "border-on-surface scale-110 shadow-md" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-label-sm text-on-surface-variant mb-1.5 font-medium">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            >
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 gap-3">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-error hover:bg-error/5 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Cancel Appointment
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-medium hover:bg-surface-variant/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                {appointment ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
