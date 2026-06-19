import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

function getConnectionString(): string {
  const direct = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL_UNPOOLED
  if (direct) return direct

  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")

  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("pooler.supabase.com") || parsed.searchParams.get("pgbouncer") === "true") {
      const match = parsed.username.match(/^postgres\.(.+)$/)
      if (match) {
        const projectRef = match[1]
        parsed.hostname = `db.${projectRef}.supabase.co`
        parsed.port = "5432"
        parsed.search = ""
        return parsed.toString()
      }
    }
  } catch {}

  return url
}

function createPrisma() {
  const pool = new pg.Pool({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
  })
  return new PrismaClient({
    adapter: new PrismaPg(pool),
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
