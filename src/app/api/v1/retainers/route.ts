import { NextRequest, NextResponse } from "next/server"
import { getRetainers, createRetainer, updateRetainerContent } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1"))
    const pageSize = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("pageSize") || "50")))
    const search = req.nextUrl.searchParams.get("search") || undefined
    const status = req.nextUrl.searchParams.get("status") || undefined
    const result = await getRetainers({ page, pageSize, search, status })
    return NextResponse.json(result)
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const retainer = await createRetainer(body)
    return NextResponse.json(retainer, { status: 201 })
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const id = req.nextUrl.searchParams.get("id")
    const delivered = req.nextUrl.searchParams.get("delivered")
    if (!id || !delivered) return NextResponse.json({ error: "id and delivered required" }, { status: 400 })
    const retainer = await updateRetainerContent(id, parseInt(delivered))
    return retainer ? NextResponse.json(retainer) : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
