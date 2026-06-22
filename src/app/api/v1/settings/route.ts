import { NextResponse } from "next/server"
import { getSettings } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const settings = await getSettings()

    return NextResponse.json(settings)
  } catch (e) {
    console.error("settings error:", e)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(_req: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    return NextResponse.json({ message: "Settings updated" })
  } catch (e) {
    console.error("settings error:", e)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
