import { NextResponse } from "next/server"
import { getClients, getProjects, getExpenses } from "@/lib/data-service"
import { generateWeeklyDigest } from "@/lib/ai"
import { db } from "@/lib/data-service"

export async function GET() {
  try {
    const clientsResult = await getClients()
    const projectsResult = await getProjects()
    const digest = await generateWeeklyDigest(clientsResult.items, projectsResult.items)
    return NextResponse.json(digest)
  } catch (e) {
    console.error("ai digest error:", e)
    return NextResponse.json({ error: "Failed to generate digest" }, { status: 500 })
  }
}
