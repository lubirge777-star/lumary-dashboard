import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/data-service"
import { auth } from "@/lib/auth"
import { can } from "@/lib/permissions"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!can((session.user as any)?.role, "manage:users")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const p = await db()
    if (!p) return NextResponse.json({ error: "Database unavailable" }, { status: 500 })

    const users = await p.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json(users)
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!can((session.user as any)?.role, "manage:users")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { name, email, role: userRole } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 })
    }

    const p = await db()
    if (!p) return NextResponse.json({ error: "Database unavailable" }, { status: 500 })

    const existing = await p.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    const user = await p.user.create({
      data: { name, email, role: userRole || "AGENT" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!can((session.user as any)?.role, "manage:users")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const id = req.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const body = await req.json()
    const p = await db()
    if (!p) return NextResponse.json({ error: "Database unavailable" }, { status: 500 })

    const user = await p.user.update({
      where: { id },
      data: { role: body.role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!can((session.user as any)?.role, "manage:users")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const id = req.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const p = await db()
    if (!p) return NextResponse.json({ error: "Database unavailable" }, { status: 500 })

    const target = await p.user.findUnique({ where: { id }, select: { role: true } })
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (target.role === "OWNER") {
      return NextResponse.json({ error: "Cannot delete OWNER users" }, { status: 403 })
    }

    await p.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("route handler error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
