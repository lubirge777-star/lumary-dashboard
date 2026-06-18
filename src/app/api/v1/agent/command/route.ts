/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateContent } from "@/lib/gemini"

const COMMAND_PROMPT = `You are the command interpreter for LUMARY Dashboard. 
Given a natural language request, extract the database action and parameters as JSON.
Available actions: createClient, updateClient, deleteClient, createProject, updateProjectStatus, createPayment, sendMessage, createExpense, createAppointment.

Respond ONLY with a JSON object:
{"action":"actionName","params":{...},"explanation":"brief explanation in Swahili/English"}`

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 })

    const aiResponse = await generateContent(COMMAND_PROMPT, text)

    let cmd: any
    try {
      cmd = JSON.parse(aiResponse || "{}")
    } catch {
      return NextResponse.json({ error: "Could not parse command" }, { status: 400 })
    }

    if (!cmd.action) return NextResponse.json({ error: "No action detected" }, { status: 400 })

    let result: any
    switch (cmd.action) {
      case "createClient": {
        result = await prisma.client.create({ data: { ...cmd.params, createdAt: new Date(), updatedAt: new Date() } as any })
        break
      }
      case "updateClient": {
        const { id, ...data } = cmd.params
        result = await prisma.client.update({ where: { id }, data: { ...data, updatedAt: new Date() } as any })
        break
      }
      case "deleteClient": {
        await prisma.client.delete({ where: { id: cmd.params.id } })
        result = { deleted: true }
        break
      }
      case "createProject": {
        result = await prisma.project.create({ data: { ...cmd.params, createdAt: new Date(), updatedAt: new Date() } as any })
        break
      }
      case "updateProjectStatus": {
        result = await prisma.project.update({ where: { id: cmd.params.id }, data: { status: cmd.params.status } })
        break
      }
      case "createPayment": {
        result = await prisma.payment.create({ data: { ...cmd.params, createdAt: new Date() } as any })
        break
      }
      default:
        return NextResponse.json({ error: `Unsupported: ${cmd.action}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, action: cmd.action, explanation: cmd.explanation, data: result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
