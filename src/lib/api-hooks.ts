"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/toast"
import type { Client, Project, Payment, Expense, Retainer, ProjectStatus, Appointment, AppointmentFormData } from "@/types"

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function useClients(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : ""
      return fetchJson(`/api/v1/clients${qs}`)
    },
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: Omit<Client, "id" | "createdAt" | "updatedAt" | "totalSpent">) =>
      fetchJson("/api/v1/clients", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] })
      toast("success", "Client Created", "The client has been added successfully")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      fetchJson(`/api/v1/clients?id=${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] })
      toast("success", "Client Updated", "The client has been updated")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/clients?id=${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] })
      toast("success", "Client Deleted", "The client has been removed")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useProjects(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : ""
      return fetchJson(`/api/v1/projects${qs}`)
    },
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: Omit<Project, "id" | "createdAt" | "daysInStage" | "revisionsUsed">) =>
      fetchJson("/api/v1/projects", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] })
      toast("success", "Project Created", "The project has been created")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useUpdateProjectStatus() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      fetchJson(`/api/v1/projects?id=${id}&status=${status}`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] })
      toast("success", "Status Updated", "Project status has been changed")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function usePayments(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : ""
      return fetchJson(`/api/v1/payments${qs}`)
    },
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: Omit<Payment, "id" | "createdAt">) =>
      fetchJson("/api/v1/payments", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] })
      toast("success", "Payment Added", "The payment has been recorded")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useExpenses(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : ""
      return fetchJson(`/api/v1/expenses${qs}`)
    },
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: Omit<Expense, "id" | "createdAt">) =>
      fetchJson("/api/v1/expenses", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] })
      toast("success", "Expense Added", "The expense has been logged")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useRetainers(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["retainers", params],
    queryFn: () => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : ""
      return fetchJson(`/api/v1/retainers${qs}`)
    },
  })
}

export function useCreateRetainer() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: Omit<Retainer, "id" | "createdAt" | "renewalDaysLeft">) =>
      fetchJson("/api/v1/retainers", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retainers"] })
      toast("success", "Retainer Created", "The retainer has been added")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useFinance() {
  return useQuery({
    queryKey: ["finance"],
    queryFn: () => fetchJson("/api/v1/finance"),
  })
}

export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: () => fetchJson("/api/v1/activities"),
  })
}

export function usePipeline() {
  return useQuery({
    queryKey: ["pipeline"],
    queryFn: () => fetchJson("/api/v1/pipeline"),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => fetchJson(`/api/v1/clients/${id}`),
    enabled: !!id,
  })
}

export function useClientMessages(id: string) {
  return useQuery({
    queryKey: ["client-messages", id],
    queryFn: () => fetchJson(`/api/v1/clients/${id}?include=messages`),
    enabled: !!id,
    select: (data: any) => data.messages ?? [],
  })
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchJson("/api/v1/settings"),
  })
}

export function useAISuggestions() {
  return useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: () => fetchJson("/api/v1/ai/suggestions"),
    refetchInterval: 30000,
  })
}

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: () => fetchJson("/api/v1/appointments") as Promise<Appointment[]>,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (data: AppointmentFormData) =>
      fetchJson("/api/v1/appointments", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] })
      toast("success", "Appointment Created", "The appointment has been scheduled")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AppointmentFormData> }) =>
      fetchJson(`/api/v1/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] })
      toast("success", "Appointment Updated", "The appointment has been updated")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title?: string }) =>
      fetchJson(`/api/v1/appointments/${id}?title=${encodeURIComponent(title || "")}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] })
      toast("success", "Appointment Cancelled", "The appointment has been removed")
    },
    onError: (err: Error) => toast("error", "Failed", err.message),
  })
}

export function useDismissAISuggestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/ai/suggestions?id=${id}`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-suggestions"] }),
  })
}
