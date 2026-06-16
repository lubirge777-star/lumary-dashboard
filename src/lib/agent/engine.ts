import type { AgentNudgeInput, CheckerResult } from "./types"
import { hasBeenSent, storeNudge } from "./memory"
import { sendWhatsApp } from "@/lib/whatsapp"

async function loadChecker(name: string): Promise<{ check: () => Promise<CheckerResult> } | null> {
  try {
    return await import(`./checkers/${name}`)
  } catch {
    return null
  }
}

export async function runAgentCheck(): Promise<AgentNudgeInput[]> {
  const allNudges: AgentNudgeInput[] = []
  const checkerNames = ["habits", "goals", "focus", "payments", "projects", "weekly-review"]

  for (const name of checkerNames) {
    try {
      const checker = await loadChecker(name)
      if (checker) {
        const result = await checker.check()
        allNudges.push(...result.nudges)
      }
    } catch (e) {
      console.error(`Agent checker "${name}" failed:`, e)
    }
  }

  try {
    const { generateCrossDomainInsights } = await import("./insights")
    const insights = await generateCrossDomainInsights()
    allNudges.push(...insights)
  } catch (e) {
    console.error("Agent cross-domain insights failed:", e)
  }

  const newNudges: AgentNudgeInput[] = []

  for (const nudge of allNudges) {
    const alreadySent = await hasBeenSent(nudge)
    if (alreadySent) continue

    await storeNudge(nudge, nudge.sendWhatsApp ?? false)

    if (nudge.sendWhatsApp) {
      try {
        await sendWhatsApp(process.env.WHATSAPP_NUMBER || "255651360763", `🔔 LUMARY Agent\n\n${nudge.title}\n${nudge.message}`)
      } catch (e) {
        console.error("Agent WhatsApp delivery failed:", e)
      }
    }

    newNudges.push(nudge)
  }

  return newNudges
}
