import { NextResponse } from "next/server"
import { getAppointments, createAppointment } from "@/lib/data-service"

export async function GET() {
  try {
    const appointments = await getAppointments()
    return NextResponse.json(appointments)
  } catch (e) {
    console.error("appointments GET error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const appointment = await createAppointment(body)
    if (!appointment) return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
    return NextResponse.json(appointment, { status: 201 })
  } catch (e) {
    console.error("appointments POST error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
