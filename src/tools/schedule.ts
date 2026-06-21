import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const scheduleTools: ToolDef[] = [
  {
    name: "query_appointments",
    description: "List calendar appointments, optionally filtered by date range.",
    parameters: {
      from: { type: "string", description: "Start of range (ISO date)" },
      to: { type: "string", description: "End of range (ISO date)" },
      status: { type: "string", description: "Filter by status", enum: ["scheduled", "completed", "cancelled"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.from || args.to) {
        where.startTime = {}
        if (args.from) where.startTime.gte = new Date(args.from as string)
        if (args.to) where.startTime.lte = new Date(args.to as string)
      }
      if (args.status) where.status = args.status as string
      const appointments = await prisma.appointment.findMany({
        where,
        orderBy: { startTime: "asc" },
      })
      return { success: true, data: appointments }
    },
  },
  {
    name: "create_appointment",
    description: "Book a new appointment/event on the calendar.",
    parameters: {
      title: { type: "string", description: "Event title", required: true },
      startTime: { type: "string", description: "Start time (ISO date)", required: true },
      endTime: { type: "string", description: "End time (ISO date)" },
      description: { type: "string", description: "Event description" },
      clientId: { type: "string", description: "Associated client ID" },
      allDay: { type: "boolean", description: "All-day event" },
    },
    handler: async (args) => {
      const appointment = await prisma.appointment.create({
        data: {
          title: args.title as string,
          startTime: new Date(args.startTime as string),
          endTime: args.endTime ? new Date(args.endTime as string) : null,
          description: (args.description as string) ?? null,
          clientId: (args.clientId as string) ?? null,
          allDay: (args.allDay as boolean) ?? false,
        },
      })
      return { success: true, data: appointment }
    },
  },
]
