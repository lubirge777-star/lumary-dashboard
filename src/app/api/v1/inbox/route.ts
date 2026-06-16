import { NextResponse } from "next/server"
import { getInboxThreads, getClients } from "@/lib/data-service"

export async function GET() {
  try {
    const threads = await getInboxThreads()
    return NextResponse.json(threads)
  } catch (e) {
    console.error("inbox error:", e)
    return NextResponse.json({ error: "Failed to fetch inbox" }, { status: 500 })
  }
}
