import { NextResponse } from "next/server"
import { parseWebhookBody, createWebhookResponse } from "@/lib/webhook"
import { logWebhookLog, createActivity } from "@/lib/data-service"

export async function POST(request: Request) {
  try {
    const body = await parseWebhookBody(request)

    const eventType = (body.event as string) || (body.type as string) || "submission"
    const resultId = (body.resultId as string) || ""

    await logWebhookLog({
      source: "typebot",
      eventType,
      payload: body,
      status: "received",
    })

    if (eventType === "submission" || eventType === "complete") {
      const answers = (body.answers as { label?: string; value?: unknown }[]) || []
      const extracted = answers.map((a) => ({
        label: a.label ?? "",
        value: a.value ?? "",
      }))

      console.log(`[Webhook:Typebot] Submission ${resultId}:`, JSON.stringify(extracted))

      const summary = extracted.map((a) => `${a.label}: ${a.value}`).join(" | ")
      await createActivity({
        type: "NOTE_ADDED",
        targetType: "Typebot",
        targetId: resultId,
        meta: { answers: extracted, summary: summary || "" },
      })
    }

    return createWebhookResponse(200, { received: true, resultId })
  } catch (error) {
    console.error("[Webhook:Typebot] Error:", error)
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "typebot" })
}
