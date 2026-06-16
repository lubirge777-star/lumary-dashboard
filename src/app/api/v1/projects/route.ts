import { NextRequest, NextResponse } from "next/server"
import { getProjects, createProject, updateProjectStatus } from "@/lib/data-service"

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1")
    const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "50")
    const search = req.nextUrl.searchParams.get("search") || undefined
    const status = req.nextUrl.searchParams.get("status") || undefined
    const serviceType = req.nextUrl.searchParams.get("serviceType") || undefined
    const clientId = req.nextUrl.searchParams.get("clientId") || undefined
    const result = await getProjects({ page, pageSize, search, status, serviceType, clientId })
    return NextResponse.json(result)
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const project = await createProject(body)
  return NextResponse.json(project, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")
  const status = req.nextUrl.searchParams.get("status")
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })
  const project = await updateProjectStatus(id, status as any)
  return project ? NextResponse.json(project) : NextResponse.json({ error: "Not found" }, { status: 404 })
}
