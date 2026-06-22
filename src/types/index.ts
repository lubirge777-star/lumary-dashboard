export type UserRole = "OWNER" | "AGENT" | "VIEWER"
export type ClientStatus = "ACTIVE" | "RETAINER" | "DORMANT" | "CHURNED"
export type ProjectStatus =
  | "NEW_INQUIRY"
  | "QUOTED"
  | "DEPOSIT_PAID"
  | "IN_PROGRESS"
  | "REVISION"
  | "FINAL_DELIVERED"
  | "PAID"
  | "RETAINER_PITCH"
export type PaymentStatus = "UNPAID" | "FIFTY_PERCENT" | "PAID" | "OVERDUE" | "REFUNDED"
export type PaymentMethod = "MPESA" | "BANK" | "CASH" | "STRIPE" | "OTHER"
export type RetainerPackage =
  | "WHATSAPP_PACK"
  | "SOCIAL_MEDIA_PACK"
  | "WEEKLY_PROMO_PACK"
  | "MONTHLY_STATUS_MARKETING"
  | "CREATOR_MONTHLY"
  | "BRAND_MANAGER"
  | "CUSTOM"
export type ActivityType =
  | "CLIENT_CREATED"
  | "PROJECT_CREATED"
  | "PROJECT_STATUS_CHANGED"
  | "PAYMENT_RECEIVED"
  | "EXPENSE_LOGGED"
  | "RETAINER_CREATED"
  | "RETAINER_RENEWED"
  | "MESSAGE_SENT"
  | "MESSAGE_RECEIVED"
  | "FILE_UPLOADED"
  | "NOTE_ADDED"
  | "SETTINGS_UPDATED"
  | "AUTOMATION_RUN"
  | "AI_SUGGESTION"
  | "INVOICE_SENT"
  | "REMINDER_SENT"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface Client {
  id: string
  name: string
  whatsappNumber: string
  email?: string
  businessType?: string
  location?: string
  servicesUsed: string[]
  totalSpent: number
  firstProjectDate?: string
  lastProjectDate?: string
  status: ClientStatus
  referralSource?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  clientId: string
  clientName?: string
  clientWhatsapp?: string
  serviceType: string
  description?: string
  quotedAmount: number
  depositAmount?: number
  status: ProjectStatus
  priority?: string
  assignedAgentId?: string
  assignedAgentName?: string
  quotedAt?: string
  depositPaidAt?: string
  startedAt?: string
  finalDeliveredAt?: string
  paidAt?: string
  revisionsUsed: number
  maxRevisions: number
  rushFee?: number
  driveFolderUrl?: string
  createdAt: string
  daysInStage: number
}

export interface Payment {
  id: string
  clientId: string
  clientName?: string
  projectId?: string
  projectService?: string
  amount: number
  usdEquiv?: number
  method: PaymentMethod
  status: PaymentStatus
  mpesaReference?: string
  receiptUrl?: string
  balanceDue?: number
  notes?: string
  paidAt?: string
  createdAt: string
}

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  receipt?: string
  notes?: string
  createdAt: string
}

export interface Retainer {
  id: string
  clientId: string
  clientName: string
  clientWhatsapp?: string
  package: RetainerPackage
  monthlyValue: number
  contentDueBy: string
  status: "active" | "paused" | "cancelled"
  currentMonth?: string
  graphicsDue: number
  graphicsDelivered: number
  paymentStatus: "paid" | "unpaid" | "overdue"
  lastPaymentDate?: string
  nextPaymentDate?: string
  createdAt: string
  renewalDaysLeft: number
}

export interface Message {
  id: string
  direction: "inbound" | "outbound"
  channel: "whatsapp" | "bot"
  content: string
  mediaUrl?: string
  clientId: string
  clientName?: string
  projectId?: string
  userId?: string
  createdAt: string
}

export interface Activity {
  id: string
  type: ActivityType
  actorId?: string
  actorName?: string
  targetType: string
  targetId: string
  meta?: Record<string, unknown>
  createdAt: string
  description: string
  icon: string
}

export interface WebhookEvent {
  id: string
  source: string
  eventType: string
  payload: Record<string, unknown>
  createdAt: string
}

export interface AutomationRule {
  id: string
  name: string
  description?: string
  trigger: string
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  isActive: boolean
  runCount: number
  lastRunAt?: string
  createdAt: string
}

export interface AutomationCondition {
  field: string
  operator: "equals" | "contains" | "gt" | "lt" | "not_empty"
  value: string
}

export interface AutomationAction {
  type: "SEND_WHATSAPP" | "UPDATE_PROJECT_STATUS" | "CREATE_ACTIVITY" | "SEND_EMAIL" | "CREATE_REMINDER"
  config: Record<string, string>
}

export interface AISuggestion {
  id: string
  type: string
  title: string
  description: string
  severity: "info" | "warning" | "success"
  meta?: Record<string, unknown>
  isDismissed: boolean
  isApplied: boolean
  createdAt: string
}

export interface InboxThread {
  id: string
  clientId: string
  clientName: string
  clientWhatsapp: string
  lastMessage: string
  lastMessageAt: string
  channel: string
  unread: number
  messages: Message[]
}

export interface Appointment {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime?: string | null
  allDay: boolean
  clientId?: string | null
  clientName?: string | null
  projectId?: string | null
  color?: string | null
  status: string
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface AppointmentFormData {
  title: string
  description?: string
  startTime: string
  endTime?: string
  allDay: boolean
  clientId?: string
  projectId?: string
  color?: string
  status?: string
}

export interface DailyDigest {
  date: string
  pendingInvoices: number
  unpaidAmount: number
  activeProjects: number
  stalledProjects: number
  dueRetainers: number
  newClients: number
  totalRevenue: number
  totalExpenses: number
  topRecommendations: string[]
}

export interface AgentMessage {
  id: string
  role: "user" | "agent"
  content: string
  mediaUrl?: string
  mediaType?: "image" | "document" | "audio" | "video"
  command?: string
  commandResult?: string
  createdAt: string
}

export interface ProjectCheckup {
  id: string
  projectId: string
  phase: string
  question: string
  answer?: string
  status: "pending" | "answered" | "skipped"
  createdAt: string
  answeredAt?: string
}

export interface Integration {
  id: string
  name: string
  type: "whatsapp" | "claude" | "webhook" | "custom"
  status: "connected" | "disconnected" | "pending" | "error"
  config: Record<string, string>
  lastSyncAt?: string
  errorMessage?: string
  createdAt: string
}

export interface ClaudeConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
}

export interface WhatsAppSyncStatus {
  state: "open" | "close" | "connecting"
  messagesToday: number
  messagesTotal: number
  lastMessageAt?: string
  qr?: string
}
