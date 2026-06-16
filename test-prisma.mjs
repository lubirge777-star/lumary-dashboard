import { PrismaClient } from "./src/generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"

const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) })

try {
  const created = await p.goal.create({ data: { level: "today", title: "Direct test", sortOrder: 0 } })
  console.log("Created:", created.id)

  const items = await p.goal.findMany()
  console.log("Found:", items.length, "items")
} catch (e) {
  console.error("Error:", e)
} finally {
  await p.$disconnect()
}
