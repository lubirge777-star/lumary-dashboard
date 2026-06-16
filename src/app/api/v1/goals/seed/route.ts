import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DEFAULT_GOALS: { level: string; title: string; description?: string; sortOrder: number }[] = [
  { level: "dream", title: "Build LUMARY into a leading East African AI-native agency", description: "A full-stack agency that combines design, AI, and strategy to serve global clients from Tanzania.", sortOrder: 0 },
  { level: "year10", title: "50+ team, 3 products", description: "Scale to 50+ team members across design, engineering, and AI. Ship 3 proprietary SaaS products.", sortOrder: 0 },
  { level: "year", title: "Full-stack freelancer with 20+ clients", description: "Operate as a top-tier full-stack freelancer serving 20+ active clients across web, brand, and AI.", sortOrder: 0 },
  { level: "quarter", title: "Ship 2 major projects, onboard 5 retainers", description: "Deliver 2 flagship projects and convert at least 5 clients to monthly retainers.", sortOrder: 0 },
  { level: "month", title: "Build systems & automate operations", description: "Set up CRM automations, create SOPs, and streamline client onboarding.", sortOrder: 0 },
  { level: "week", title: "Close 2 leads, deliver 1 milestone", description: "Follow up with 2 hot leads and deliver one major project milestone by Friday.", sortOrder: 0 },
  { level: "today", title: "Deep work block: 4 hours on priority project", description: "No meetings, no distractions. Just ship code and design.", sortOrder: 0 },
]

export async function POST() {
  try {
    const existing = await prisma.goal.count()
    if (existing > 0) return NextResponse.json({ message: "Goals already exist" }, { status: 200 })

    await prisma.goal.createMany({ data: DEFAULT_GOALS })
    const items = await prisma.goal.findMany({ orderBy: [{ level: "asc" }, { sortOrder: "asc" }] })
    return NextResponse.json({ items })
  } catch (e) {
    console.error("goals seed error:", e)
    return NextResponse.json({ error: "Failed to seed goals" }, { status: 500 })
  }
}
