import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const clientTools: ToolDef[] = [
  {
    name: "query_clients",
    description: "Search and filter clients by name, status, business type, or location.",
    parameters: {
      query: { type: "string", description: "Free-text search (name, business type, location)" },
      status: { type: "string", description: "Filter by status", enum: ["ACTIVE", "RETAINER", "DORMANT", "CHURNED"] },
      businessType: { type: "string", description: "Filter by business type (e.g. Salon, Restaurant)" },
      limit: { type: "number", description: "Max results (default 50)" },
    },
    handler: async (args) => {
      const where: any = {}
      const or: any[] = []
      if (args.query) {
        or.push({ name: { contains: args.query as string, mode: "insensitive" } })
        or.push({ businessType: { contains: args.query as string, mode: "insensitive" } })
        or.push({ location: { contains: args.query as string, mode: "insensitive" } })
        or.push({ servicesUsed: { has: args.query as string } })
      }
      if (args.status) where.status = args.status as string
      if (args.businessType) where.businessType = { contains: args.businessType as string, mode: "insensitive" }
      if (or.length > 0) where.OR = or
      const clients = await prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: (args.limit as number) ?? 50,
      })
      return { success: true, data: clients }
    },
  },
  {
    name: "get_client_detail",
    description: "Get full client details including their projects, payments, messages, and retainers.",
    parameters: {
      clientId: { type: "string", description: "Client ID", required: true },
    },
    handler: async (args) => {
      const client = await prisma.client.findUnique({
        where: { id: args.clientId as string },
        include: {
          projects: { orderBy: { createdAt: "desc" } },
          payments: { orderBy: { createdAt: "desc" } },
          messages: { orderBy: { createdAt: "desc" }, take: 50 },
          retainers: true,
        },
      })
      if (!client) return { success: false, error: "Client not found" }
      return { success: true, data: client }
    },
  },
  {
    name: "create_client",
    description: "Create a new client record.",
    parameters: {
      name: { type: "string", description: "Client full name", required: true },
      whatsappNumber: { type: "string", description: "WhatsApp phone number (e.g. 255651360001)", required: true },
      email: { type: "string", description: "Email address" },
      businessType: { type: "string", description: "Business type (Salon, Restaurant, etc.)" },
      location: { type: "string", description: "Location/area" },
      notes: { type: "string", description: "Initial notes about the client" },
      referralSource: { type: "string", description: "How they found you (Walk-in, Referral, WhatsApp, etc.)" },
    },
    handler: async (args) => {
      const client = await prisma.client.create({
        data: {
          name: args.name as string,
          whatsappNumber: args.whatsappNumber as string,
          email: (args.email as string) ?? null,
          businessType: (args.businessType as string) ?? null,
          location: (args.location as string) ?? null,
          notes: (args.notes as string) ?? null,
          referralSource: (args.referralSource as string) ?? null,
        },
      })
      return { success: true, data: client }
    },
  },
  {
    name: "update_client",
    description: "Update an existing client's fields.",
    parameters: {
      clientId: { type: "string", description: "Client ID to update", required: true },
      name: { type: "string", description: "New name" },
      email: { type: "string", description: "New email" },
      businessType: { type: "string", description: "New business type" },
      location: { type: "string", description: "New location" },
      status: { type: "string", description: "New status", enum: ["ACTIVE", "RETAINER", "DORMANT", "CHURNED"] },
      notes: { type: "string", description: "Updated notes" },
      referralSource: { type: "string", description: "Referral source" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.name) data.name = args.name
      if (args.email) data.email = args.email
      if (args.businessType) data.businessType = args.businessType
      if (args.location) data.location = args.location
      if (args.status) data.status = args.status
      if (args.notes !== undefined) data.notes = args.notes
      if (args.referralSource) data.referralSource = args.referralSource
      const client = await prisma.client.update({ where: { id: args.clientId as string }, data })
      return { success: true, data: client }
    },
  },
  {
    name: "delete_client",
    description: "Soft-delete a client by setting deletedAt.",
    parameters: {
      clientId: { type: "string", description: "Client ID to delete", required: true },
    },
    handler: async (args) => {
      await prisma.client.update({ where: { id: args.clientId as string }, data: { deletedAt: new Date() } })
      return { success: true, data: { deleted: true } }
    },
  },
]
