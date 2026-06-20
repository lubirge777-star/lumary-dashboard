import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { NextResponse } from "next/server"

export async function GET() {
  const results: Record<string, any> = {}

  // 1. Test raw SQL connection
  try {
    const raw: any = await prisma.$queryRaw(Prisma.sql`SELECT 1 as ok`)
    results.rawSql = { ok: true, result: raw }
  } catch (e: any) {
    results.rawSql = { error: e.name, code: e.code, msg: e.message?.slice(0, 200) }
    console.error("DIAG_RAW", e.name, e.code, e.message?.slice(0, 200))
  }

  // 2. Test client.count
  try {
    const c = await prisma.client.count()
    results.clientCount = c
  } catch (e: any) {
    results.clientCountErr = { name: e.name, code: e.code }
    console.error("DIAG_CNT", e.name, e.code)
  }

  // 3. Test client.findMany
  try {
    const clients = await prisma.client.findMany({ take: 1 })
    results.clientFind = { count: clients.length }
  } catch (e: any) {
    results.clientFindErr = { name: e.name, code: e.code, msg: e.message?.slice(0, 300) }
    console.error("DIAG_FM", e.name, e.code, e.message?.slice(0, 300))
  }

  // 4. Test payment.count
  try {
    const p = await prisma.payment.count()
    results.paymentCount = p
  } catch (e: any) {
    results.paymentCountErr = { name: e.name, code: e.code }
    console.error("DIAG_PCNT", e.name, e.code)
  }

  return NextResponse.json(results)
}
