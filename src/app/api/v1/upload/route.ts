import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { requireAuth } from "@/lib/require-auth"

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError

  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "bin"
    const filename = `${randomUUID()}.${ext}`
    const uploadDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(uploadDir, filename), buffer)

    return NextResponse.json({
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: `/uploads/${filename}`,
    }, { status: 201 })
  } catch (error) {
    console.error("[Upload] Error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
