import type { Client, Project, Payment, Expense, Retainer, Activity, User } from "@/types"

const now = new Date()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()

export const mockUser: User = {
  id: "u1", email: "lubirge@lumary.com", name: "Lubirge", role: "OWNER",
  createdAt: daysAgo(365),
}

export const mockClients: Client[] = [
  { id: "c1", name: "Mama Fatuma", whatsappNumber: "255651360763", email: "fatuma@salon.com", businessType: "Salon", location: "Kigamboni", servicesUsed: ["Brand Starter", "Social Media Pack"], totalSpent: 350000, status: "RETAINER", referralSource: "Walk-in", notes: "Prefers WhatsApp communication. Responds best in evenings.", createdAt: daysAgo(90), updatedAt: daysAgo(1), lastProjectDate: daysAgo(15) },
  { id: "c2", name: "Ali Hassan", whatsappNumber: "255652123456", businessType: "Student", location: "DIT Campus", servicesUsed: ["CV Redesign"], totalSpent: 10000, status: "ACTIVE", referralSource: "Classmate", createdAt: daysAgo(30), updatedAt: daysAgo(2), lastProjectDate: daysAgo(17) },
  { id: "c3", name: "Salama Salon", whatsappNumber: "255653789012", email: "salama@salon.co.tz", businessType: "Salon", location: "Mwenge", servicesUsed: ["Brand Starter", "Thumbnails"], totalSpent: 250000, status: "ACTIVE", referralSource: "Referral", notes: "Wants monthly retainer after current project completes.", createdAt: daysAgo(60), updatedAt: daysAgo(5), lastProjectDate: daysAgo(7) },
  { id: "c4", name: "Juma Bakari", whatsappNumber: "255654345678", businessType: "Restaurant", location: "Posta", servicesUsed: ["Social Media Pack"], totalSpent: 120000, status: "RETAINER", referralSource: "Walk-in", createdAt: daysAgo(120), updatedAt: daysAgo(10), lastProjectDate: daysAgo(20) },
  { id: "c5", name: "Amina Kidogo", whatsappNumber: "255655567890", businessType: "Fashion", location: "Kariakoo", servicesUsed: ["Brand Starter"], totalSpent: 0, status: "DORMANT", referralSource: "Behance", notes: "Asked for quote but never followed up.", createdAt: daysAgo(180), updatedAt: daysAgo(90) },
  { id: "c6", name: "Bwana Mfalme", whatsappNumber: "255656789012", businessType: "Photography", location: "Upanga", servicesUsed: ["Brand Starter", "CV Redesign", "Thumbnails"], totalSpent: 550000, status: "ACTIVE", referralSource: "WhatsApp", createdAt: daysAgo(200), updatedAt: daysAgo(3), lastProjectDate: daysAgo(5) },
]

export const mockProjects: Project[] = [
  { id: "p1", clientId: "c1", clientName: "Mama Fatuma", clientWhatsapp: "255651360763", serviceType: "Social Media Pack", quotedAmount: 120000, depositAmount: 60000, status: "IN_PROGRESS", priority: "normal", assignedAgentId: "u1", assignedAgentName: "Lubirge", revisionsUsed: 1, maxRevisions: 2, createdAt: daysAgo(10), daysInStage: 4 },
  { id: "p2", clientId: "c1", clientName: "Mama Fatuma", serviceType: "Brand Starter", quotedAmount: 250000, depositAmount: 125000, status: "PAID", revisionsUsed: 1, maxRevisions: 2, createdAt: daysAgo(60), daysInStage: 30, paidAt: daysAgo(30) },
  { id: "p3", clientId: "c2", clientName: "Ali Hassan", serviceType: "CV Redesign", quotedAmount: 10000, status: "NEW_INQUIRY", revisionsUsed: 0, maxRevisions: 2, createdAt: daysAgo(2), daysInStage: 2 },
  { id: "p4", clientId: "c3", clientName: "Salama Salon", serviceType: "Brand Starter", quotedAmount: 200000, depositAmount: 100000, status: "QUOTED", revisionsUsed: 0, maxRevisions: 2, createdAt: daysAgo(5), daysInStage: 3 },
  { id: "p5", clientId: "c4", clientName: "Juma Bakari", serviceType: "Social Media Pack", quotedAmount: 120000, depositAmount: 60000, status: "DEPOSIT_PAID", revisionsUsed: 0, maxRevisions: 2, createdAt: daysAgo(7), daysInStage: 4 },
  { id: "p6", clientId: "c6", clientName: "Bwana Mfalme", serviceType: "Brand Starter", quotedAmount: 350000, depositAmount: 175000, status: "FINAL_DELIVERED", revisionsUsed: 1, maxRevisions: 2, createdAt: daysAgo(45), daysInStage: 3, driveFolderUrl: "https://drive.google.com/drive/folders/abc123" },
  { id: "p7", clientId: "c3", clientName: "Salama Salon", serviceType: "Thumbnails", quotedAmount: 50000, status: "REVISION", priority: "rush", createdAt: daysAgo(8), daysInStage: 6, revisionsUsed: 2, maxRevisions: 2 },
]

export const mockPayments: Payment[] = [
  { id: "pay1", clientId: "c1", clientName: "Mama Fatuma", projectId: "p1", projectService: "Social Media Pack", amount: 60000, method: "MPESA", status: "PAID", mpesaReference: "SFD123456", paidAt: daysAgo(10), createdAt: daysAgo(10) },
  { id: "pay2", clientId: "c1", clientName: "Mama Fatuma", projectId: "p2", projectService: "Brand Starter", amount: 125000, method: "MPESA", status: "PAID", mpesaReference: "SFD123001", paidAt: daysAgo(55), createdAt: daysAgo(55) },
  { id: "pay3", clientId: "c1", clientName: "Mama Fatuma", amount: 125000, method: "MPESA", status: "PAID", mpesaReference: "SFD123002", paidAt: daysAgo(30), createdAt: daysAgo(30) },
  { id: "pay4", clientId: "c3", clientName: "Salama Salon", projectId: "p4", projectService: "Brand Starter", amount: 100000, method: "BANK", status: "PAID", paidAt: daysAgo(5), createdAt: daysAgo(5), balanceDue: 100000 },
  { id: "pay5", clientId: "c4", clientName: "Juma Bakari", projectId: "p5", projectService: "Social Media Pack", amount: 60000, method: "MPESA", status: "FIFTY_PERCENT", paidAt: daysAgo(7), createdAt: daysAgo(7), balanceDue: 60000 },
  { id: "pay6", clientId: "c6", clientName: "Bwana Mfalme", projectId: "p6", projectService: "Brand Starter", amount: 175000, method: "MPESA", status: "PAID", mpesaReference: "SFD123789", paidAt: daysAgo(40), createdAt: daysAgo(40), balanceDue: 175000 },
  { id: "pay7", clientId: "c6", clientName: "Bwana Mfalme", amount: 175000, method: "CASH", status: "PAID", paidAt: daysAgo(10), createdAt: daysAgo(10) },
]

export const mockExpenses: Expense[] = [
  { id: "e1", category: "Software", description: "Canva Pro subscription", amount: 15000, createdAt: daysAgo(2) },
  { id: "e2", category: "Internet", description: "Monthly fibre bill", amount: 8000, createdAt: daysAgo(5) },
  { id: "e3", category: "Transport", description: "Client meeting fare", amount: 5000, createdAt: daysAgo(7) },
  { id: "e4", category: "Marketing", description: "Instagram ads", amount: 12000, createdAt: daysAgo(10) },
  { id: "e5", category: "Equipment", description: "External hard drive", amount: 35000, createdAt: daysAgo(15) },
  { id: "e6", category: "Software", description: "Remove.bg credits", amount: 12000, createdAt: daysAgo(3) },
]

export const mockRetainers: Retainer[] = [
  { id: "r1", clientId: "c1", clientName: "Mama Fatuma", clientWhatsapp: "255651360763", package: "SOCIAL_MEDIA_PACK", monthlyValue: 120000, contentDueBy: new Date(now.getFullYear(), now.getMonth(), 25).toISOString(), status: "active", currentMonth: "2026-06", graphicsDue: 12, graphicsDelivered: 8, paymentStatus: "paid", lastPaymentDate: daysAgo(5), nextPaymentDate: daysAgo(20), renewalDaysLeft: 12, createdAt: daysAgo(90) },
  { id: "r2", clientId: "c4", clientName: "Juma Bakari", clientWhatsapp: "255654345678", package: "CREATOR_MONTHLY", monthlyValue: 130000, contentDueBy: new Date(now.getFullYear(), now.getMonth(), 25).toISOString(), status: "active", currentMonth: "2026-06", graphicsDue: 12, graphicsDelivered: 0, paymentStatus: "unpaid", lastPaymentDate: daysAgo(30), nextPaymentDate: daysAgo(3), renewalDaysLeft: 3, createdAt: daysAgo(120) },
]

export const mockActivities: Activity[] = [
  { id: "a1", type: "PAYMENT_RECEIVED", actorName: "System", targetType: "Payment", targetId: "pay1", createdAt: daysAgo(0.08), description: "Payment TSh 50,000 received from Mama Fatuma", icon: "💰" },
  { id: "a2", type: "PROJECT_STATUS_CHANGED", actorName: "Lubirge", targetType: "Project", targetId: "p1", createdAt: daysAgo(0.2), description: 'Project "Social Media Pack" moved to In Progress', icon: "📋" },
  { id: "a3", type: "CLIENT_CREATED", actorName: "Lubirge", targetType: "Client", targetId: "c2", createdAt: daysAgo(1), description: "New client Ali Hassan added", icon: "👤" },
  { id: "a4", type: "MESSAGE_SENT", actorName: "Lubirge", targetType: "Message", targetId: "m1", createdAt: daysAgo(2), description: "WhatsApp message sent to Mama Fatuma — Deposit reminder", icon: "💬" },
  { id: "a5", type: "RETAINER_RENEWED", actorName: "System", targetType: "Retainer", targetId: "r1", createdAt: daysAgo(3), description: "Retainer renewed — Social Media Pack (TSh 120,000)", icon: "♻️" },
  { id: "a6", type: "EXPENSE_LOGGED", actorName: "Lubirge", targetType: "Expense", targetId: "e1", createdAt: daysAgo(4), description: "Expense logged: Software — Canva Pro TSh 15,000", icon: "💳" },
  { id: "a7", type: "PROJECT_STATUS_CHANGED", actorName: "Lubirge", targetType: "Project", targetId: "p7", createdAt: daysAgo(5), description: 'Project "Thumbnails" — Revision requested', icon: "🔄" },
  { id: "a8", type: "PAYMENT_RECEIVED", actorName: "System", targetType: "Payment", targetId: "pay7", createdAt: daysAgo(6), description: "Payment TSh 175,000 received from Bwana Mfalme", icon: "💰" },
]
