import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

const defaults: Record<string, string> = {
  mission: "Build LUMARY into the leading East African AI-native agency — empowering businesses with intelligent automation and design.",
  vision: "A future where every African business runs on AI-powered systems — starting with my own. 50+ team, 3 products, full-stack freedom.",
  core_values: "Deen first, continuous learning, craftsmanship over hustle, build in public, lift as you climb.",
}

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const configs = await prisma.userConfig.findMany()
    const map: Record<string, string> = { ...defaults }
    for (const c of configs) map[c.key] = c.value
    return NextResponse.json(map)
  } catch (e) {
    console.error("Failed to fetch user config:", e)
    return NextResponse.json(defaults)
  }
}

export async function PUT(req: Request) {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const body = await req.json()
    const { key, value } = body
    if (!key || typeof value !== "string") {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 })
    }
    const config = await prisma.userConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
    return NextResponse.json(config)
  } catch (e) {
    console.error("Failed to update user config:", e)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
