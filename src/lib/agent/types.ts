export interface AgentNudgeInput {
  type: "habit" | "goal" | "focus" | "payment" | "project" | "review" | "cross_domain"
  title: string
  message: string
  severity: "low" | "medium" | "high" | "critical"
  category?: string
  metadata?: Record<string, unknown>
  sendWhatsApp?: boolean
}

export interface CheckerResult {
  nudges: AgentNudgeInput[]
}

export interface DomainChecker {
  name: string
  check: () => Promise<CheckerResult>
}
