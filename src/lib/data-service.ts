import type { Client, Project, Payment, Expense, Retainer, Activity, ProjectStatus, Appointment, AppointmentFormData } from "@/types"
import { mockClients, mockProjects, mockPayments, mockExpenses, mockRetainers, mockActivities } from "@/lib/mock/data"

export async function saveMessage(data: { direction: string; channel: string; content: string; clientId: string; projectId?: string }): Promise<{ id: string } | null> {
  const p = await db()
  if (!p) return null
  const msg = await p.message.create({ data: { ...data, createdAt: new Date() } as any })
  return msg as any
}

export async function findClientByPhone(whatsappNumber: string) {
  const p = await db()
  if (p) return p.client.findFirst({ where: { whatsappNumber } }) as any
  return mockClients.find((c) => c.whatsappNumber === whatsappNumber) ?? null
}

export async function createActivity(data: { type: string; actorName?: string; targetType: string; targetId: string; meta?: any }) {
  const p = await db()
  if (p) return p.activity.create({ data: { ...data, meta: data.meta ?? {}, createdAt: new Date() } as any }) as any
  return null
}

export async function logWebhookLog(data: { source: string; eventType: string; payload: any; status?: string; error?: string }) {
  const p = await db()
  if (p) return p.webhookLog.create({ data: { ...data, payload: data.payload ?? {}, status: data.status ?? "received", createdAt: new Date() } as any }) as any
  return null
}

export async function getWebhookLogs(params?: PaginationParams): Promise<PaginatedResult<any>> {
  const p = await db()
  if (p) {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const [items, total] = await Promise.all([
      p.webhookLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      p.webhookLog.count(),
    ])
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
  return { items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  [key: string]: string | number | undefined
}

const usePrisma = true

function paginate<T>(items: T[], page = 1, pageSize = 50): PaginatedResult<T> {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function db(): Promise<typeof import("./prisma").prisma | null> {
  if (!usePrisma) return null
  try { return (await import("./prisma")).prisma } catch { return null }
}

export async function getClients(params?: PaginationParams): Promise<PaginatedResult<Client>> {
  const p = await db()
  if (p) {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const where: any = {}
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { whatsappNumber: { contains: params.search } },
      ]
    }
    if (params?.status) where.status = params.status
    if (params?.referralSource) where.referralSource = params.referralSource
    const [items, total] = await Promise.all([
      p.client.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      p.client.count({ where }),
    ])
    return { items: items as unknown as Client[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
  let filtered = [...mockClients]
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.whatsappNumber.includes(q))
  }
  if (params?.status) filtered = filtered.filter((c) => c.status === params.status)
  if (params?.referralSource) filtered = filtered.filter((c) => c.referralSource === params.referralSource)
  return paginate(filtered, params?.page, params?.pageSize)
}

export async function getClient(id: string): Promise<Client | null> {
  const p = await db()
  if (p) { const r = await p.client.findUnique({ where: { id } }); return r as unknown as Client | null }
  return mockClients.find((c) => c.id === id) ?? null
}

export async function createClient(data: Omit<Client, "id" | "createdAt" | "updatedAt" | "totalSpent">): Promise<Client> {
  const p = await db()
  if (p) { const r = await p.client.create({ data: { ...data, totalSpent: 0 } as any }); return r as unknown as Client }
  const client: Client = { ...data, id: `c${Date.now()}`, totalSpent: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  mockClients.unshift(client)
  return client
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client | null> {
  const p = await db()
  if (p) { const r = await p.client.update({ where: { id }, data: data as any }); return r as unknown as Client | null }
  const idx = mockClients.findIndex((c) => c.id === id)
  if (idx === -1) return null
  mockClients[idx] = { ...mockClients[idx], ...data, updatedAt: new Date().toISOString() }
  return mockClients[idx]
}

export async function deleteClient(id: string): Promise<boolean> {
  const p = await db()
  if (p) { await p.client.delete({ where: { id } }); return true }
  const idx = mockClients.findIndex((c) => c.id === id)
  if (idx === -1) return false
  mockClients.splice(idx, 1)
  return true
}

export async function getProjects(params?: PaginationParams): Promise<PaginatedResult<Project>> {
  const p = await db()
  if (p) {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const where: any = {}
    if (params?.search) {
      where.OR = [
        { clientName: { contains: params.search, mode: "insensitive" } },
        { serviceType: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ]
    }
    if (params?.status) where.status = params.status
    if (params?.serviceType) where.serviceType = params.serviceType
    if (params?.clientId) where.clientId = params.clientId
    const [items, total] = await Promise.all([
      p.project.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      p.project.count({ where }),
    ])
    return { items: items as unknown as Project[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
  let filtered = [...mockProjects]
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter((pr) => pr.clientName?.toLowerCase().includes(q) || pr.serviceType.toLowerCase().includes(q) || pr.description?.toLowerCase().includes(q))
  }
  if (params?.status) filtered = filtered.filter((pr) => pr.status === params.status)
  if (params?.serviceType) filtered = filtered.filter((pr) => pr.serviceType === params.serviceType)
  if (params?.clientId) filtered = filtered.filter((pr) => pr.clientId === params.clientId)
  return paginate(filtered, params?.page, params?.pageSize)
}

export async function createProject(data: Omit<Project, "id" | "createdAt" | "daysInStage" | "revisionsUsed">): Promise<Project> {
  const p = await db()
  if (p) { const r = await p.project.create({ data: data as any }); return r as unknown as Project }
  const project: Project = { ...data, id: `p${Date.now()}`, createdAt: new Date().toISOString(), daysInStage: 0, revisionsUsed: 0 }
  mockProjects.unshift(project)
  return project
}

export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project | null> {
  const p = await db()
  if (p) { const r = await p.project.update({ where: { id }, data: { status } }); return r as unknown as Project | null }
  const idx = mockProjects.findIndex((pr) => pr.id === id)
  if (idx === -1) return null
  mockProjects[idx] = { ...mockProjects[idx], status, daysInStage: 0 }
  return mockProjects[idx]
}

export async function getPayments(params?: PaginationParams): Promise<PaginatedResult<Payment>> {
  const p = await db()
  if (p) {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const where: any = {}
    if (params?.search) {
      where.OR = [
        { clientName: { contains: params.search, mode: "insensitive" } },
        { projectService: { contains: params.search, mode: "insensitive" } },
        { mpesaReference: { contains: params.search } },
      ]
    }
    if (params?.status) where.status = params.status
    if (params?.method) where.method = params.method
    const [items, total] = await Promise.all([
      p.payment.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      p.payment.count({ where }),
    ])
    return { items: items as unknown as Payment[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
  let filtered = [...mockPayments]
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter((pay) => pay.clientName?.toLowerCase().includes(q) || pay.projectService?.toLowerCase().includes(q) || pay.mpesaReference?.includes(q))
  }
  if (params?.status) filtered = filtered.filter((pay) => pay.status === params.status)
  if (params?.method) filtered = filtered.filter((pay) => pay.method === params.method)
  return paginate(filtered, params?.page, params?.pageSize)
}

export async function createPayment(data: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
  const p = await db()
  if (p) { const r = await p.payment.create({ data: data as any }); return r as unknown as Payment }
  const payment: Payment = { ...data, id: `pay${Date.now()}`, createdAt: new Date().toISOString() }
  mockPayments.unshift(payment)
  return payment
}

export async function getExpenses(params?: PaginationParams): Promise<PaginatedResult<Expense>> {
  const p = await db()
  if (p) {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const [items, total] = await Promise.all([
      p.expense.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      p.expense.count(),
    ])
    return { items: items as unknown as Expense[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
  return paginate(mockExpenses, params?.page, params?.pageSize)
}

export async function createExpense(data: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
  const p = await db()
  if (p) { const r = await p.expense.create({ data: data as any }); return r as unknown as Expense }
  const expense: Expense = { ...data, id: `e${Date.now()}`, createdAt: new Date().toISOString() }
  mockExpenses.unshift(expense)
  return expense
}

export async function getRetainers(params?: PaginationParams): Promise<PaginatedResult<Retainer>> {
  const p = await db()
  if (p) {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const where: any = {}
    if (params?.search) {
      where.OR = [
        { clientName: { contains: params.search, mode: "insensitive" } },
      ]
    }
    if (params?.status) where.status = params.status
    const [items, total] = await Promise.all([
      p.retainer.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      p.retainer.count({ where }),
    ])
    return { items: items as unknown as Retainer[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
  let filtered = [...mockRetainers]
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter((r) => r.clientName.toLowerCase().includes(q))
  }
  if (params?.status) filtered = filtered.filter((r) => r.status === params.status)
  return paginate(filtered, params?.page, params?.pageSize)
}

export async function createRetainer(data: Omit<Retainer, "id" | "createdAt" | "renewalDaysLeft">): Promise<Retainer> {
  const p = await db()
  if (p) { const r = await p.retainer.create({ data: data as any }); return r as unknown as Retainer }
  const retainer: Retainer = { ...data, id: `r${Date.now()}`, createdAt: new Date().toISOString(), renewalDaysLeft: 30 }
  mockRetainers.unshift(retainer)
  return retainer
}

export async function updateRetainerContent(id: string, graphicsDelivered: number): Promise<Retainer | null> {
  const p = await db()
  if (p) { const r = await p.retainer.update({ where: { id }, data: { graphicsDelivered } as any }); return r as unknown as Retainer | null }
  const idx = mockRetainers.findIndex((r) => r.id === id)
  if (idx === -1) return null
  mockRetainers[idx] = { ...mockRetainers[idx], graphicsDelivered }
  return mockRetainers[idx]
}

export async function getClientWithRelations(id: string, include?: string[]) {
  const p = await db()
  const relations = include ?? ["projects", "payments", "messages", "retainers", "activities"]

  if (p) {
    const includeObj: any = {}

    if (relations.includes("projects")) includeObj.projects = { orderBy: { createdAt: "desc" } }
    if (relations.includes("payments")) includeObj.payments = { orderBy: { createdAt: "desc" } }
    if (relations.includes("messages")) includeObj.messages = { orderBy: { createdAt: "asc" } }
    if (relations.includes("retainers")) includeObj.retainers = { orderBy: { createdAt: "desc" } }

    const client = await p.client.findUnique({
      where: { id },
      include: Object.keys(includeObj).length > 0 ? includeObj : undefined,
    })

    if (!client) return null

    const result: any = { ...client }

    if (relations.includes("activities")) {
      result.activities = await p.activity.findMany({
        where: { targetType: "Client", targetId: id },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      })
    }

    return result
  }

  const mockClient = mockClients.find((c) => c.id === id)
  if (!mockClient) return null

  const result: any = { ...mockClient }

  if (relations.includes("projects")) {
    result.projects = mockProjects.filter((p) => p.clientId === id)
  }
  if (relations.includes("payments")) {
    result.payments = mockPayments.filter((p) => p.clientId === id)
  }
  if (relations.includes("messages")) {
    result.messages = []
  }
  if (relations.includes("retainers")) {
    result.retainers = mockRetainers.filter((r) => r.clientId === id)
  }
  if (relations.includes("activities")) {
    result.activities = mockActivities.filter((a) => a.targetType === "Client" && a.targetId === id)
  }

  return result
}

export async function getClientMessages(id: string) {
  return getMessagesByClient(id)
}

export async function getActivities(params?: PaginationParams): Promise<PaginatedResult<Activity>> {
  if (params) return paginate(mockActivities, params.page, params.pageSize)
  return { items: mockActivities, total: mockActivities.length, page: 1, pageSize: mockActivities.length, totalPages: 1 }
}

export async function getFinanceSummary() {
  const payments = await getPayments()
  const expenses = await getExpenses()
  const revenue = payments.items.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0)
  const totalExpenses = expenses.items.reduce((s, e) => s + e.amount, 0)
  const profit = revenue - totalExpenses
  return { revenue, expenses: totalExpenses, profit, taxReserve: Math.round(profit * 0.03) }
}

export async function getPipelineData() {
  const projects = await getProjects()
  const grouped: Record<string, Project[]> = {
    NEW_INQUIRY: [], QUOTED: [], DEPOSIT_PAID: [], IN_PROGRESS: [],
    REVISION: [], FINAL_DELIVERED: [], PAID: [], RETAINER_PITCH: [],
  }
  for (const p of projects.items) {
    if (grouped[p.status]) grouped[p.status].push(p)
  }
  return grouped
}

export async function getSettings() {
  return {
    pricingFloors: { "Brand Starter": 150000, "Social Media Pack": 120000, "CV Redesign": 10000, "Thumbnails": 5000, "Weekly Promo Pack": 80000 },
    integrations: [],
    quickReplies: [
      { key: "greeting", title: "Greeting", content: "Habari! Karibu LUMARY Studio. Ningekusaidiaje leo?" },
      { key: "pricing", title: "Pricing Request", content: "Asante kwa kuuliza. Haya ndio maelezo ya bei zetu..." },
      { key: "followup", title: "Follow Up", content: "Habari! Nilikuwa nakuangalia kuhusu mradi wako. Uko tayari kuanza?" },
      { key: "thanks", title: "Thank You", content: "Asante sana! Tunafurahi kufanya kazi nawe." },
    ],
  }
}

export async function getMessagesByClient(clientId: string) {
  const p = await db()
  if (p) {
    return p.message.findMany({ where: { clientId }, orderBy: { createdAt: "asc" } }) as any
  }
  return []
}

export async function getInboxThreads() {
  const p = await db()
  if (p) {
    const messages = await p.message.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
    })
    const grouped = new Map<string, any>()
    for (const msg of messages as any[]) {
      const cid = msg.clientId
      if (!grouped.has(cid)) {
        const whatsappMsgs = messages.filter((m: any) => m.clientId === cid && m.channel === "whatsapp")
        grouped.set(cid, {
          id: cid,
          clientId: cid,
          clientName: msg.client?.name || "Unknown",
          clientWhatsapp: msg.client?.whatsappNumber || "",
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          channel: msg.channel,
          unread: 0,
          messages: messages.filter((m: any) => m.clientId === cid).reverse(),
        })
      }
    }
    return Array.from(grouped.values())
  }
  return []
}

export async function getAutomationRules() {
  const p = await db()
  if (p) {
    return p.automationRule.findMany({ orderBy: { createdAt: "desc" } }) as any
  }
  return []
}

export async function createAutomationRule(data: any) {
  const p = await db()
  if (p) {
    return p.automationRule.create({ data }) as any
  }
  return null
}

export async function updateAutomationRule(id: string, data: any) {
  const p = await db()
  if (p) {
    return p.automationRule.update({ where: { id }, data }) as any
  }
  return null
}

export async function deleteAutomationRule(id: string) {
  const p = await db()
  if (p) {
    await p.automationRule.delete({ where: { id } })
    return true
  }
  return false
}

export async function getAppointments(): Promise<Appointment[]> {
  const p = await db()
  if (p) {
    const items = await p.appointment.findMany({ orderBy: { startTime: "desc" } })
    return items as unknown as Appointment[]
  }
  return []
}

export async function createAppointment(data: AppointmentFormData): Promise<Appointment | null> {
  const p = await db()
  if (p) {
    const appointment = await p.appointment.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        allDay: data.allDay ?? false,
        clientId: data.clientId ?? null,
        projectId: data.projectId ?? null,
        color: data.color ?? null,
        status: data.status ?? "scheduled",
        createdAt: new Date(),
      } as any,
    })
    await createActivity({
      type: "APPOINTMENT_SCHEDULED",
      targetType: "Appointment",
      targetId: appointment.id,
      meta: { title: data.title },
    })
    return appointment as unknown as Appointment
  }
  return null
}

export async function updateAppointment(id: string, data: Partial<AppointmentFormData>): Promise<Appointment | null> {
  const p = await db()
  if (p) {
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime)
    if (data.endTime !== undefined) updateData.endTime = data.endTime ? new Date(data.endTime) : null
    if (data.allDay !== undefined) updateData.allDay = data.allDay
    if (data.clientId !== undefined) updateData.clientId = data.clientId ?? null
    if (data.projectId !== undefined) updateData.projectId = data.projectId ?? null
    if (data.color !== undefined) updateData.color = data.color ?? null
    if (data.status !== undefined) updateData.status = data.status
    const appointment = await p.appointment.update({ where: { id }, data: updateData })
    return appointment as unknown as Appointment
  }
  return null
}

export async function deleteAppointment(id: string, title?: string): Promise<boolean> {
  const p = await db()
  if (p) {
    await p.appointment.delete({ where: { id } })
    await createActivity({
      type: "APPOINTMENT_CANCELLED",
      targetType: "Appointment",
      targetId: id,
      meta: { title: title ?? "Unknown" },
    })
    return true
  }
  return false
}
