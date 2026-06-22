import { NextRequest, NextResponse } from "next/server"
import { updateAppointment, deleteAppointment } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const appointment = await updateAppointment(id, body)
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(appointment)
  } catch (e) {
    console.error("appointment PATCH error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const { id } = await params
    const title = request.nextUrl.searchParams.get("title") || undefined
    const ok = await deleteAppointment(id, title)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("appointment DELETE error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
