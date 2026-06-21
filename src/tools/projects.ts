import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const projectTools: ToolDef[] = [
  {
    name: "query_projects",
    description: "Search and filter projects by status, client, or service type.",
    parameters: {
      status: { type: "string", description: "Filter by status", enum: ["NEW_INQUIRY", "QUOTED", "DEPOSIT_PAID", "IN_PROGRESS", "REVISION", "FINAL_DELIVERED", "PAID", "RETAINER_PITCH"] },
      clientId: { type: "string", description: "Filter by client ID" },
      serviceType: { type: "string", description: "Filter by service type (e.g. Brand Starter, Logo Design)" },
      limit: { type: "number", description: "Max results (default 50)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.status) where.status = args.status as string
      if (args.clientId) where.clientId = args.clientId as string
      if (args.serviceType) where.serviceType = { contains: args.serviceType as string, mode: "insensitive" }
      const projects = await prisma.project.findMany({
        where,
        include: { client: { select: { name: true, whatsappNumber: true } } },
        orderBy: { createdAt: "desc" },
        take: (args.limit as number) ?? 50,
      })
      return { success: true, data: projects }
    },
  },
  {
    name: "get_project_detail",
    description: "Get full project details with client info, payments, messages, and pipeline steps.",
    parameters: {
      projectId: { type: "string", description: "Project ID", required: true },
    },
    handler: async (args) => {
      const project = await prisma.project.findUnique({
        where: { id: args.projectId as string },
        include: {
          client: { select: { id: true, name: true, whatsappNumber: true, email: true } },
          payments: { orderBy: { createdAt: "desc" } },
          messages: { orderBy: { createdAt: "desc" }, take: 30 },
          steps: { orderBy: { createdAt: "asc" } },
        },
      })
      if (!project) return { success: false, error: "Project not found" }
      return { success: true, data: project }
    },
  },
  {
    name: "create_project",
    description: "Create a new project for an existing client.",
    parameters: {
      clientId: { type: "string", description: "Client ID", required: true },
      serviceType: { type: "string", description: "Service type (e.g. Brand Starter, Logo Design)", required: true },
      description: { type: "string", description: "Project description" },
      quotedAmount: { type: "number", description: "Quoted amount in TSh" },
      depositAmount: { type: "number", description: "Deposit amount in TSh" },
      priority: { type: "string", description: "Priority", enum: ["low", "medium", "high", "urgent"] },
    },
    handler: async (args) => {
      const project = await prisma.project.create({
        data: {
          clientId: args.clientId as string,
          serviceType: args.serviceType as string,
          description: (args.description as string) ?? null,
          quotedAmount: (args.quotedAmount as number) ?? 0,
          depositAmount: (args.depositAmount as number) ?? null,
          priority: (args.priority as string) ?? "medium",
          status: "NEW_INQUIRY",
        },
      })
      return { success: true, data: project }
    },
  },
  {
    name: "update_project",
    description: "Update project status, amounts, or other fields. Also logs a pipeline step when status changes.",
    parameters: {
      projectId: { type: "string", description: "Project ID", required: true },
      status: { type: "string", description: "New status", enum: ["NEW_INQUIRY", "QUOTED", "DEPOSIT_PAID", "IN_PROGRESS", "REVISION", "FINAL_DELIVERED", "PAID", "RETAINER_PITCH"] },
      quotedAmount: { type: "number", description: "Update quoted amount" },
      depositAmount: { type: "number", description: "Update deposit amount" },
      description: { type: "string", description: "Update description" },
      priority: { type: "string", description: "Update priority", enum: ["low", "medium", "high", "urgent"] },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.status) {
        data.status = args.status
        const stepNames: Record<string, string> = {
          NEW_INQUIRY: "inquiry", QUOTED: "quote", DEPOSIT_PAID: "deposit",
          IN_PROGRESS: "brief", REVISION: "revise", FINAL_DELIVERED: "final", PAID: "followup",
        }
        const step = stepNames[args.status as string] || "inquiry"
        await prisma.pipelineStep.upsert({
          where: { projectId_step: { projectId: args.projectId as string, step } },
          create: { projectId: args.projectId as string, step, completedAt: new Date() },
          update: { completedAt: new Date() },
        })
      }
      if (args.quotedAmount !== undefined) data.quotedAmount = args.quotedAmount
      if (args.depositAmount !== undefined) data.depositAmount = args.depositAmount
      if (args.description !== undefined) data.description = args.description
      if (args.priority) data.priority = args.priority
      const project = await prisma.project.update({ where: { id: args.projectId as string }, data })
      return { success: true, data: project }
    },
  },
  {
    name: "delete_project",
    description: "Delete a project permanently.",
    parameters: {
      projectId: { type: "string", description: "Project ID", required: true },
    },
    handler: async (args) => {
      await prisma.project.delete({ where: { id: args.projectId as string } })
      return { success: true, data: { deleted: true } }
    },
  },
]
