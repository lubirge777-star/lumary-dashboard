"use client"

import { useState, useMemo, useDeferredValue } from "react"
import { useProjects, useUpdateProjectStatus } from "@/lib/api-hooks"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Badge, statusBadge } from "@/components/ui/badge"
import { formatTSh, formatRelativeDate } from "@/lib/utils"
import { Project, ProjectStatus } from "@/types"
import { Plus, GripVertical, AlertCircle, Search, X } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

const columns: { status: ProjectStatus; label: string; color: string }[] = [
  { status: "NEW_INQUIRY", label: "New Inquiry", color: "bg-gray-500" },
  { status: "QUOTED", label: "Quoted", color: "bg-blue-500" },
  { status: "DEPOSIT_PAID", label: "Deposit Paid", color: "bg-yellow-500" },
  { status: "IN_PROGRESS", label: "In Progress", color: "bg-orange-500" },
  { status: "REVISION", label: "Revision", color: "bg-purple-500" },
  { status: "FINAL_DELIVERED", label: "Final Delivered", color: "bg-teal-500" },
  { status: "PAID", label: "Paid", color: "bg-emerald-500" },
  { status: "RETAINER_PITCH", label: "Retainer Pitch", color: "bg-yellow-500" },
]

function KanbanCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-outline-variant/40 dark:border-white/5 bg-white dark:bg-surface-container-high p-3.5 cursor-grab active:cursor-grabbing hover:border-primary/20 hover:shadow-md hover:shadow-black/20 transition-all"
    >
      <div className="flex items-start gap-2">
        <button className="mt-0.5 cursor-grab text-on-surface-variant/80 hover:text-on-surface-variant transition-colors" {...attributes} {...listeners}>
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface truncate">{project.clientName}</p>
          <p className="text-xs text-on-surface-variant/80 mt-0.5">{project.serviceType}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="font-mono text-xs text-primary font-semibold">{formatTSh(project.quotedAmount)}</span>
            <span className={`text-xs font-mono ${
              project.daysInStage > 7 ? "text-error" : "text-on-surface-variant/80"
            }`}>
              {project.daysInStage}d
            </span>
            {project.priority === "rush" && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-error/15 text-error animate-pulse tracking-wide">
                Rush
              </span>
            )}
          </div>
          {project.assignedAgentName && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/30 to-primary-fixed-dim/10 flex items-center justify-center text-[10px] text-primary font-semibold">
                {project.assignedAgentName.charAt(0)}
              </div>
              <span className="text-[10px] text-on-surface-variant/80">{project.assignedAgentName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Column({
  column,
  projects,
}: {
  column: (typeof columns)[0]
  projects: Project[]
}) {
  const ids = projects.map((p) => p.id)

  return (
    <div className="flex-shrink-0 w-64 flex flex-col rounded-xl border border-outline-variant/50 dark:border-white/5 bg-white dark:bg-surface-container-high">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm`} style={{ boxShadow: `0 0 6px var(--tw-shadow-color)` }} />
          <span className="text-sm font-semibold text-on-surface">{column.label}</span>
        </div>
        <span className="text-xs text-on-surface-variant font-mono bg-white px-2 py-0.5 rounded-lg border border-outline-variant/20">
          {projects.length}
        </span>
      </div>
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {projects.map((p) => (
            <KanbanCard key={p.id} project={p} />
          ))}
        </SortableContext>
        {projects.length === 0 && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-outline-variant/20 rounded-xl">
            <p className="text-xs text-on-surface-variant/80">Drop items here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function PipelinePage() {
  const [search, setSearch] = useState("")
  const [serviceFilter, setServiceFilter] = useState<string | null>(null)
  const deferredSearch = useDeferredValue(search)
  const params = useMemo(() => {
    const p: Record<string, string> = {}
    if (deferredSearch) p.search = deferredSearch
    if (serviceFilter) p.serviceType = serviceFilter
    return p
  }, [deferredSearch, serviceFilter])
  const { data, isLoading, error, refetch } = useProjects(params)
  const projects: Project[] = data?.items ?? []
  const updateProjectStatus = useUpdateProjectStatus()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const grouped = useMemo(() => {
    const map = new Map<ProjectStatus, Project[]>()
    for (const col of columns) {
      map.set(
        col.status,
        projects.filter((p) => p.status === col.status)
      )
    }
    return map
  }, [projects])

  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const projectId = active.id as string
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    const overColumn = columns.find((c) => c.status === over.id)
    if (overColumn && overColumn.status !== project.status) {
      updateProjectStatus.mutate({ id: projectId, status: overColumn.status })
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-on-surface mb-2">Failed to load projects</h3>
          <p className="text-sm text-on-surface-variant/80 mb-6">Please try refreshing the page</p>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Pipeline</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Drag projects across stages</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-1.5" />
          New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/80" />
          <input
            className="w-full bg-white border border-outline-variant rounded-xl pl-9 pr-8 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 hover:text-on-surface">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[{ label: "All", value: null }, { label: "Brand Starter", value: "Brand Starter" }, { label: "Social Media Pack", value: "Social Media Pack" }, { label: "Thumbnails", value: "Thumbnails" }, { label: "CV Redesign", value: "CV Redesign" }, { label: "Weekly Promo Pack", value: "Weekly Promo Pack" }].map((f) => (
            <button
              key={f.value ?? "all"}
              onClick={() => setServiceFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                serviceFilter === f.value
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-white text-on-surface-variant border border-outline-variant hover:border-primary/30 hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-on-surface-variant/80">Loading projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/30 dark:border-white/5 bg-white dark:bg-surface-container-high">
          <EmptyState
            title="No projects"
            description="Create your first project to get started"
          />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {columns.map((col) => (
              <SortableContext key={col.status} items={[col.status]}>
                <Column column={col} projects={grouped.get(col.status) || []} />
              </SortableContext>
            ))}
          </div>

          <DragOverlay>
            {activeProject && (
              <div className="rounded-xl border border-primary/60 dark:border-white/5 bg-white dark:bg-surface-container-high p-3.5 w-64 shadow-2xl shadow-black/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary-fixed-dim/10 flex items-center justify-center text-primary text-xs font-semibold">
                    {activeProject.clientName?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{activeProject.clientName ?? "Unknown"}</p>
                    <p className="text-xs text-on-surface-variant/80">{activeProject.serviceType ?? "—"}</p>
                  </div>
                </div>
                <p className="font-mono text-sm text-primary font-semibold mt-2">
                  {activeProject.quotedAmount ? formatTSh(activeProject.quotedAmount) : "—"}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
