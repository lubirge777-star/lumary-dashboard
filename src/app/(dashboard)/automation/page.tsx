"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Zap, Plus, Play, Pause, Trash2, Settings, ChevronDown, Save, Check, X } from "lucide-react"
import { useToast } from "@/components/ui/toast"

const triggerOptions = [
  { value: "message_received", label: "Message Received" },
  { value: "message_sent", label: "Message Sent" },
  { value: "payment_received", label: "Payment Received" },
  { value: "project_created", label: "Project Created" },
  { value: "project_status_changed", label: "Project Status Changed" },
  { value: "retainer_due", label: "Retainer Due" },
  { value: "client_created", label: "Client Created" },
  { value: "inactivity_alert", label: "Inactivity Alert" },
]

const actionTypeOptions = [
  { value: "SEND_WHATSAPP", label: "Send WhatsApp" },
  { value: "UPDATE_PROJECT_STATUS", label: "Update Project Status" },
  { value: "CREATE_ACTIVITY", label: "Log Activity" },
  { value: "CREATE_REMINDER", label: "Create Reminder" },
]

const projectStatusOptions = [
  { value: "NEW_INQUIRY", label: "New Inquiry" },
  { value: "QUOTED", label: "Quoted" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "FINAL_DELIVERED", label: "Final Delivered" },
  { value: "PAID", label: "Paid" },
]

export default function AutomationPage() {
  useEffect(() => { document.title = "Automation — LUMARY Studio" }, [])
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)

  const { data: rules = [], isLoading, error, refetch } = useQuery({
    queryKey: ["automation-rules"],
    queryFn: () => fetch("/api/v1/automation-rules").then((r) => r.json()),
  })

  const toggleMutation = useMutation({
    mutationFn: (rule: any) =>
      fetch("/api/v1/automation-rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["automation-rules"] }); toast("success", "Rule Toggled") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/automation-rules?id=${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["automation-rules"] }); toast("success", "Rule Deleted") },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Automation</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Rules that run automatically when events happen</p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      {showForm && (
        <RuleForm
          rule={editingRule}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["automation-rules"] }) }}
        />
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-on-surface-variant/80 p-8 text-center">Loading rules...</div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant/80 mb-3">Failed to load rules</p>
              <button onClick={() => refetch()} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold">Retry</button>
            </div>
          </div>
        ) : rules.length === 0 ? (
          <div className="rounded-xl bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-12 text-center">
            <Zap className="w-12 h-12 mx-auto text-on-surface-variant/80 mb-4" />
            <h3 className="text-lg font-semibold text-on-surface mb-2">No automation rules yet</h3>
            <p className="text-sm text-on-surface-variant/80 mb-6">Create rules to automate WhatsApp replies, project updates, and more</p>
            <button
              onClick={() => { setEditingRule(null); setShowForm(true) }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Your First Rule
            </button>
          </div>
        ) : (
          rules.map((rule: any) => (
            <div key={rule.id} className={`rounded-xl border p-5 transition-all ${
              rule.isActive ? "bg-white dark:bg-surface-container-high border-outline-variant/30 dark:border-white/5" : "bg-white/50 dark:bg-surface-container/50 border-dashed border-outline-variant/20 dark:border-white/5 opacity-60"
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    rule.isActive ? "bg-primary/10 text-primary" : "bg-outline-variant/30 text-on-surface-variant/80"
                  }`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">{rule.name}</h3>
                    <p className="text-xs text-on-surface-variant/80 mt-0.5">{rule.description || "No description"}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] uppercase tracking-wider text-primary font-semibold bg-primary/5 px-2 py-0.5 rounded-md">
                        {triggerOptions.find((t) => t.value === rule.trigger)?.label || rule.trigger}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/70">
                        Run {rule.runCount} time(s)
                      </span>
                      {rule.lastRunAt && (
                        <span className="text-[10px] text-on-surface-variant/70">
                          Last: {new Date(rule.lastRunAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMutation.mutate(rule)}
                    className={`p-2 rounded-lg transition-all ${
                      rule.isActive ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-outline-variant/30 text-on-surface-variant/80 hover:bg-outline-variant/50"
                    }`}
                  >
                    {rule.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditingRule(rule); setShowForm(true) }}
                    className="p-2 rounded-lg bg-outline-variant/30 text-on-surface-variant/80 hover:bg-outline-variant/50 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this rule?")) deleteMutation.mutate(rule.id) }}
                    className="p-2 rounded-lg bg-outline-variant/30 text-on-surface-variant/80 hover:bg-red-100 hover:text-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RuleForm({ rule, onClose, onSaved }: { rule: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast()
  const [name, setName] = useState(rule?.name || "")
  const [description, setDescription] = useState(rule?.description || "")
  const [trigger, setTrigger] = useState(rule?.trigger || "message_received")
  const [actions, setActions] = useState<any[]>(rule?.actions || [{ type: "CREATE_ACTIVITY", config: {} }])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { name, description, trigger, actions, isActive: rule?.isActive ?? true }
      if (rule) {
        await fetch("/api/v1/automation-rules", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: rule.id, ...payload }),
        })
      } else {
        await fetch("/api/v1/automation-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
      onSaved()
      toast("success", rule ? "Rule Updated" : "Rule Created", `"${name}" has been saved`)
    } catch (err: any) {
      toast("error", "Failed", err?.message || "Could not save rule")
    } finally {
      setSaving(false)
    }
  }

  const updateAction = (index: number, field: string, value: string) => {
    const updated = [...actions]
    if (field === "type") {
      updated[index] = { type: value, config: {} }
    } else {
      updated[index] = { ...updated[index], config: { ...updated[index].config, [field]: value } }
    }
    setActions(updated)
  }

  return (
    <div className="rounded-xl bg-white dark:bg-surface-container-high border border-primary/20 dark:border-white/5 p-6 space-y-5 shadow-lg shadow-primary/5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-on-surface tracking-wide">
          {rule ? "Edit Rule" : "New Automation Rule"}
        </h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-outline-variant/30 transition-all">
          <X className="w-4 h-4 text-on-surface-variant/80" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-on-surface-variant block mb-1.5">Rule Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Welcome new client"
            className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-on-surface-variant block mb-1.5">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="When should this rule run?"
            className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-on-surface-variant block mb-1.5">Trigger Event</label>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
          >
            {triggerOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-on-surface-variant block mb-1.5">Actions</label>
          <div className="space-y-2">
            {actions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-white/40 dark:bg-surface-container/40 border border-outline-variant/20 dark:border-white/5">
                <select
                  value={action.type}
                  onChange={(e) => updateAction(i, "type", e.target.value)}
                  className="flex-1 bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none"
                >
                  {actionTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {action.type === "SEND_WHATSAPP" && (
                  <input
                    value={action.config.template || ""}
                    onChange={(e) => updateAction(i, "template", e.target.value)}
                    placeholder="Message template..."
                    className="flex-[2] bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
                  />
                )}
                {action.type === "UPDATE_PROJECT_STATUS" && (
                  <select
                    value={action.config.status || ""}
                    onChange={(e) => updateAction(i, "status", e.target.value)}
                    className="flex-1 bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none"
                  >
                    <option value="">Select status...</option>
                    {projectStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
                {action.type === "CREATE_REMINDER" && (
                  <input
                    value={action.config.note || ""}
                    onChange={(e) => updateAction(i, "note", e.target.value)}
                    placeholder="Reminder note..."
                    className="flex-[2] bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
                  />
                )}
                <button
                  onClick={() => setActions(actions.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActions([...actions, { type: "CREATE_ACTIVITY", config: {} }])}
            className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Action
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
        <button onClick={onClose} className="px-4 py-2 text-sm text-on-surface-variant/80 hover:text-on-surface transition-all">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name || saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Rule</>}
        </button>
      </div>
    </div>
  )
}
