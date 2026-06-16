import { NextResponse } from "next/server"
import { getAutomationRules, createAutomationRule, updateAutomationRule, deleteAutomationRule } from "@/lib/data-service"

export async function GET() {
  try {
    const rules = await getAutomationRules()
    return NextResponse.json(rules)
  } catch (e) {
    console.error("automation-rules error:", e)
    return NextResponse.json({ error: "Failed to fetch automation rules" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rule = await createAutomationRule(body)
    return NextResponse.json(rule, { status: 201 })
  } catch (e) {
    console.error("automation-rules error:", e)
    return NextResponse.json({ error: "Failed to create automation rule" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const rule = await updateAutomationRule(id, data)
    return NextResponse.json(rule)
  } catch (e) {
    console.error("automation-rules error:", e)
    return NextResponse.json({ error: "Failed to update automation rule" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    await deleteAutomationRule(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("automation-rules error:", e)
    return NextResponse.json({ error: "Failed to delete automation rule" }, { status: 500 })
  }
}
