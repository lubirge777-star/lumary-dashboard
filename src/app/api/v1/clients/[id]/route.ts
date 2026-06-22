import { NextRequest, NextResponse } from "next/server"
import { getClientWithRelations } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth) return auth

  const { id } = await params
  const include = request.nextUrl.searchParams.get("include")
  const includeArr = include ? include.split(",").map((s) => s.trim()) : undefined

  try {
    const client = await getClientWithRelations(id, includeArr)

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
