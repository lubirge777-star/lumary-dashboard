/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// Maps action labels to executable functions
const actionMap: Record<string, (body: any) => Promise<unknown>> = {
  "create-client": async (body) => prisma.client.create({ data: body }),
  "create-project": async (body) => prisma.project.create({ data: body }),
  "create-payment": async (body) => prisma.payment.create({ data: body }),
  "create-habit-log": async (body) => prisma.habitLog.create({ data: body }),
  "create-journal-entry": async (body) => prisma.journalEntry.create({ data: body }),
  "update-project-status": async (body) => prisma.project.update({ where: { id: body.id }, data: { status: body.status } }),
  "update-payment-status": async (body) => prisma.payment.update({ where: { id: body.id }, data: { status: body.status } }),
  "run-cron": async () => {
    const res = await fetch(new URL("/api/v1/agent/cron", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
    return res.json()
  },
  "create-custom-page": async (body) => prisma.customPage.create({ data: body }),
  "delete-custom-page": async (body) => prisma.customPage.delete({ where: { id: body.id } }),
  "send-whatsapp": async (body) => {
    const res = await fetch(new URL("/api/v1/messages/send", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    })
    return res.json()
  },
}

export async function POST(req: NextRequest) {
  try {
    const { action, body } = await req.json()
    if (!action || !actionMap[action]) {
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    const result = await actionMap[action](body || {})
    return Response.json({ success: true, data: result })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
