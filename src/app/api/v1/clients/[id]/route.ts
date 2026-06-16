import { NextRequest, NextResponse } from "next/server"
import { getClientWithRelations } from "@/lib/data-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
