import { NextResponse } from "next/server"
import { getSettings } from "@/lib/data-service"
import { checkEvolutionConnection } from "@/lib/whatsapp"

export async function GET() {
  try {
    const settings = await getSettings()

    const evolutionConnection = await checkEvolutionConnection()

    const integrations = [
      {
        name: "Evolution API",
        status: evolutionConnection.connected ? "connected" : evolutionConnection.state === "connecting" ? "pending" : "disconnected",
        desc: "WhatsApp messaging via Baileys WebSocket",
        state: evolutionConnection.state || "unknown",
        managerUrl: evolutionConnection.managerUrl || "http://localhost:8080/manager",
      },
      {
        name: "Chatwoot",
        status: process.env.CHATWOOT_API_KEY ? "connected" : "disconnected",
        desc: "Customer support platform",
      },
      {
        name: "Typebot",
        status: process.env.TYPEBOT_API_KEY ? "connected" : "disconnected",
        desc: "Chatbot automation",
      },
    ]

    return NextResponse.json({
      ...settings,
      integrations,
    })
  } catch (e) {
    console.error("settings error:", e)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(_req: Request) {
  try {
    return NextResponse.json({ message: "Settings updated" })
  } catch (e) {
    console.error("settings error:", e)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
