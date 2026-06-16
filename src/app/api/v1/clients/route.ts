import { NextRequest, NextResponse } from "next/server"
import { getClients, getClient, createClient, updateClient, deleteClient } from "@/lib/data-service"

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (id) {
      const client = await getClient(id)
      return client ? NextResponse.json(client) : NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1")
    const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "50")
    const search = req.nextUrl.searchParams.get("search") || undefined
    const status = req.nextUrl.searchParams.get("status") || undefined
    const referralSource = req.nextUrl.searchParams.get("referralSource") || undefined
    const result = await getClients({ page, pageSize, search, status, referralSource })
    return NextResponse.json(result)
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const client = await createClient(body)
    return NextResponse.json(client, { status: 201 })
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const body = await req.json()
    const client = await updateClient(id, body)
    return client ? NextResponse.json(client) : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const ok = await deleteClient(id)
    return ok ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
