export interface TrajectoryMilestoneDefault {
  year: string
  label: string
  target: string
  income: string
}

export const DEFAULT_TRAJECTORY: TrajectoryMilestoneDefault[] = [
  { year: "Phase 1", label: "Foundations & First Clients", target: "HTML/CSS/JS + Figma + first 5 clients", income: "$100–400/mo" },
  { year: "Year 1", label: "Frontend Developer", target: "React + TypeScript + Next.js, 10 clients, first retainer", income: "$500–1,500/mo" },
  { year: "Year 2", label: "Full-Stack Freelancer", target: "Node.js + PostgreSQL + mobile app, agency workflow", income: "$1K–4K/mo" },
  { year: "Year 3", label: "Senior Dev + First Product", target: "DevOps + AI, micro-SaaS MVP, team of 2", income: "$3K–8K/mo" },
  { year: "Year 5", label: "Studio Owner", target: "LUMARY studio with 5+ team, 2 products, 20+ retainers", income: "$5K–15K/mo" },
  { year: "Year 10", label: "AI-Native Agency", target: "50+ team, 3 products, East Africa leader", income: "$15K–50K/mo" },
]
