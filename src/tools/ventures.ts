import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const ventureTools: ToolDef[] = [
  // ── Ideas ──
  {
    name: "query_ideas",
    description: "List and filter ideas by status.",
    parameters: {
      status: { type: "string", description: "Filter by status", enum: ["idea", "talking", "building", "validated", "abandoned"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.status) where.status = args.status as string
      const ideas = await prisma.idea.findMany({ where, orderBy: { createdAt: "desc" } })
      return { success: true, data: ideas }
    },
  },
  {
    name: "create_idea",
    description: "Create a new business idea for validation.",
    parameters: {
      problem: { type: "string", description: "Problem statement", required: true },
      solution: { type: "string", description: "Proposed solution" },
      targetUser: { type: "string", description: "Target user/customer" },
    },
    handler: async (args) => {
      const idea = await prisma.idea.create({
        data: {
          problem: args.problem as string,
          solution: (args.solution as string) ?? null,
          targetUser: (args.targetUser as string) ?? null,
        },
      })
      return { success: true, data: idea }
    },
  },
  {
    name: "update_idea",
    description: "Update idea details, status, or validation notes.",
    parameters: {
      ideaId: { type: "string", description: "Idea ID", required: true },
      problem: { type: "string", description: "Updated problem" },
      solution: { type: "string", description: "Updated solution" },
      targetUser: { type: "string", description: "Updated target user" },
      validationNotes: { type: "string", description: "Notes from customer interviews" },
      status: { type: "string", description: "New status", enum: ["idea", "talking", "building", "validated", "abandoned"] },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.problem) data.problem = args.problem
      if (args.solution !== undefined) data.solution = args.solution
      if (args.targetUser !== undefined) data.targetUser = args.targetUser
      if (args.validationNotes !== undefined) data.validationNotes = args.validationNotes
      if (args.status) data.status = args.status
      const idea = await prisma.idea.update({ where: { id: args.ideaId as string }, data })
      return { success: true, data: idea }
    },
  },
  {
    name: "delete_idea",
    description: "Delete an idea permanently.",
    parameters: {
      ideaId: { type: "string", description: "Idea ID", required: true },
    },
    handler: async (args) => {
      await prisma.idea.delete({ where: { id: args.ideaId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── SaaS Ideas ──
  {
    name: "query_saas_ideas",
    description: "List SaaS idea bank entries.",
    parameters: {
      status: { type: "string", description: "Filter by status", enum: ["idea", "validating", "building", "live", "abandoned"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.status) where.status = args.status as string
      const ideas = await prisma.saasIdea.findMany({ where, orderBy: { createdAt: "desc" } })
      return { success: true, data: ideas }
    },
  },
  {
    name: "create_saas_idea",
    description: "Add a new micro-SaaS idea.",
    parameters: {
      name: { type: "string", description: "Idea name", required: true },
      description: { type: "string", description: "What it does" },
      market: { type: "string", description: "Target market" },
      techStack: { type: "string", description: "Technologies to use" },
    },
    handler: async (args) => {
      const idea = await prisma.saasIdea.create({
        data: {
          name: args.name as string,
          description: (args.description as string) ?? null,
          market: (args.market as string) ?? null,
          techStack: (args.techStack as string) ?? null,
        },
      })
      return { success: true, data: idea }
    },
  },
  {
    name: "update_saas_idea",
    description: "Update a SaaS idea's status, market, or URL.",
    parameters: {
      ideaId: { type: "string", description: "SaaS idea ID", required: true },
      name: { type: "string", description: "Updated name" },
      description: { type: "string", description: "Updated description" },
      market: { type: "string", description: "Updated market" },
      status: { type: "string", description: "New status", enum: ["idea", "validating", "building", "live", "abandoned"] },
      url: { type: "string", description: "Live URL" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.name) data.name = args.name
      if (args.description !== undefined) data.description = args.description
      if (args.market !== undefined) data.market = args.market
      if (args.status) data.status = args.status
      if (args.url !== undefined) data.url = args.url
      const idea = await prisma.saasIdea.update({ where: { id: args.ideaId as string }, data })
      return { success: true, data: idea }
    },
  },
  {
    name: "delete_saas_idea",
    description: "Delete a SaaS idea permanently.",
    parameters: {
      ideaId: { type: "string", description: "SaaS idea ID", required: true },
    },
    handler: async (args) => {
      await prisma.saasIdea.delete({ where: { id: args.ideaId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Portfolio Projects ──
  {
    name: "query_portfolio_projects",
    description: "List portfolio/personal projects.",
    parameters: {
      status: { type: "string", description: "Filter by status", enum: ["idea", "building", "shipped", "earning"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.status) where.status = args.status as string
      const projects = await prisma.portfolioProject.findMany({ where, orderBy: { createdAt: "desc" } })
      return { success: true, data: projects }
    },
  },
  {
    name: "create_portfolio_project",
    description: "Add a new portfolio project.",
    parameters: {
      name: { type: "string", description: "Project name", required: true },
      description: { type: "string", description: "What it does" },
      techStack: { type: "string", description: "Technologies used" },
      url: { type: "string", description: "Project URL" },
    },
    handler: async (args) => {
      const project = await prisma.portfolioProject.create({
        data: {
          name: args.name as string,
          description: (args.description as string) ?? null,
          techStack: (args.techStack as string) ?? null,
          url: (args.url as string) ?? null,
        },
      })
      return { success: true, data: project }
    },
  },
  {
    name: "update_portfolio_project",
    description: "Update portfolio project status, income, or details.",
    parameters: {
      projectId: { type: "string", description: "Portfolio project ID", required: true },
      name: { type: "string", description: "Updated name" },
      description: { type: "string", description: "Updated description" },
      status: { type: "string", description: "New status", enum: ["idea", "building", "shipped", "earning"] },
      url: { type: "string", description: "Updated URL" },
      income: { type: "number", description: "Income generated in TSh" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.name) data.name = args.name
      if (args.description !== undefined) data.description = args.description
      if (args.status) data.status = args.status
      if (args.url !== undefined) data.url = args.url
      if (args.income !== undefined) data.income = args.income
      const project = await prisma.portfolioProject.update({ where: { id: args.projectId as string }, data })
      return { success: true, data: project }
    },
  },
  {
    name: "delete_portfolio_project",
    description: "Delete a portfolio project.",
    parameters: {
      projectId: { type: "string", description: "Portfolio project ID", required: true },
    },
    handler: async (args) => {
      await prisma.portfolioProject.delete({ where: { id: args.projectId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Contacts / Network ──
  {
    name: "query_contacts",
    description: "Search network contacts by name, company, or platform.",
    parameters: {
      query: { type: "string", description: "Free-text search (name, company, role)" },
      platform: { type: "string", description: "Filter by platform", enum: ["linkedin", "whatsapp", "twitter", "email", "other"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.query) {
        where.OR = [
          { name: { contains: args.query as string, mode: "insensitive" } },
          { company: { contains: args.query as string, mode: "insensitive" } },
          { role: { contains: args.query as string, mode: "insensitive" } },
        ]
      }
      if (args.platform) where.platform = args.platform as string
      const contacts = await prisma.contact.findMany({ where, orderBy: { name: "asc" } })
      return { success: true, data: contacts }
    },
  },
  {
    name: "create_contact",
    description: "Add a networking contact.",
    parameters: {
      name: { type: "string", description: "Contact name", required: true },
      company: { type: "string", description: "Company/org" },
      role: { type: "string", description: "Job title or role" },
      platform: { type: "string", description: "Platform where you connected", enum: ["linkedin", "whatsapp", "twitter", "email", "other"] },
      profileUrl: { type: "string", description: "Profile URL" },
      notes: { type: "string", description: "Notes about this contact" },
    },
    handler: async (args) => {
      const contact = await prisma.contact.create({
        data: {
          name: args.name as string,
          company: (args.company as string) ?? null,
          role: (args.role as string) ?? null,
          platform: (args.platform as string) ?? null,
          profileUrl: (args.profileUrl as string) ?? null,
          notes: (args.notes as string) ?? null,
        },
      })
      return { success: true, data: contact }
    },
  },
  {
    name: "update_contact",
    description: "Update a contact's details or log when you last contacted them.",
    parameters: {
      contactId: { type: "string", description: "Contact ID", required: true },
      name: { type: "string", description: "Updated name" },
      company: { type: "string", description: "Updated company" },
      role: { type: "string", description: "Updated role" },
      notes: { type: "string", description: "Updated notes" },
      lastContacted: { type: "string", description: "ISO date when you last reached out" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.name) data.name = args.name
      if (args.company !== undefined) data.company = args.company
      if (args.role !== undefined) data.role = args.role
      if (args.notes !== undefined) data.notes = args.notes
      if (args.lastContacted) data.lastContacted = new Date(args.lastContacted as string)
      const contact = await prisma.contact.update({ where: { id: args.contactId as string }, data })
      return { success: true, data: contact }
    },
  },
  {
    name: "delete_contact",
    description: "Delete a contact.",
    parameters: {
      contactId: { type: "string", description: "Contact ID", required: true },
    },
    handler: async (args) => {
      await prisma.contact.delete({ where: { id: args.contactId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Commitments / Accountability ──
  {
    name: "query_commitments",
    description: "List accountability commitments, optionally filtered by completion status.",
    parameters: {
      completed: { type: "boolean", description: "Filter by completion (true = done, false = pending)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.completed !== undefined) where.completed = args.completed as boolean
      const commitments = await prisma.commitment.findMany({
        where,
        orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
      })
      return { success: true, data: commitments }
    },
  },
  {
    name: "create_commitment",
    description: "Create an accountability commitment with a due date.",
    parameters: {
      title: { type: "string", description: "Commitment title", required: true },
      description: { type: "string", description: "What you committed to" },
      dueDate: { type: "string", description: "ISO date when it's due" },
    },
    handler: async (args) => {
      const commitment = await prisma.commitment.create({
        data: {
          title: args.title as string,
          description: (args.description as string) ?? null,
          dueDate: args.dueDate ? new Date(args.dueDate as string) : null,
        },
      })
      return { success: true, data: commitment }
    },
  },
  {
    name: "update_commitment",
    description: "Mark commitment as done, update title, or change due date.",
    parameters: {
      commitmentId: { type: "string", description: "Commitment ID", required: true },
      title: { type: "string", description: "Updated title" },
      description: { type: "string", description: "Updated description" },
      completed: { type: "boolean", description: "Mark as completed or not" },
      dueDate: { type: "string", description: "Updated due date (ISO)" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.title) data.title = args.title
      if (args.description !== undefined) data.description = args.description
      if (args.completed !== undefined) {
        data.completed = args.completed as boolean
        if (args.completed) data.completedAt = new Date()
      }
      if (args.dueDate !== undefined) data.dueDate = args.dueDate ? new Date(args.dueDate as string) : null
      const commitment = await prisma.commitment.update({ where: { id: args.commitmentId as string }, data })
      return { success: true, data: commitment }
    },
  },
  {
    name: "delete_commitment",
    description: "Delete a commitment.",
    parameters: {
      commitmentId: { type: "string", description: "Commitment ID", required: true },
    },
    handler: async (args) => {
      await prisma.commitment.delete({ where: { id: args.commitmentId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Weekly Reviews ──
  {
    name: "query_weekly_reviews",
    description: "Get weekly review history, most recent first.",
    parameters: {
      limit: { type: "number", description: "Max results (default 12)" },
    },
    handler: async (args) => {
      const reviews = await prisma.weeklyReview.findMany({
        orderBy: { weekStart: "desc" },
        take: (args.limit as number) ?? 12,
      })
      return { success: true, data: reviews }
    },
  },
  {
    name: "create_weekly_review",
    description: "Start a weekly review entry for a given week.",
    parameters: {
      weekStart: { type: "string", description: "ISO date for Monday of the week", required: true },
    },
    handler: async (args) => {
      const review = await prisma.weeklyReview.create({
        data: { weekStart: new Date(args.weekStart as string) },
      })
      return { success: true, data: review }
    },
  },
  {
    name: "update_weekly_review",
    description: "Fill in or update a weekly review with wins, lessons, priorities, and ratings.",
    parameters: {
      reviewId: { type: "string", description: "Weekly review ID", required: true },
      wins: { type: "string", description: "What went well this week" },
      lessons: { type: "string", description: "Lessons learned" },
      priorities: { type: "string", description: "Priorities for next week" },
      energy: { type: "number", description: "Energy rating 1-10" },
      focus: { type: "number", description: "Focus rating 1-10" },
      habitPercent: { type: "number", description: "Habit completion percentage 0-100" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.wins !== undefined) data.wins = args.wins
      if (args.lessons !== undefined) data.lessons = args.lessons
      if (args.priorities !== undefined) data.priorities = args.priorities
      if (args.energy !== undefined) data.energy = args.energy
      if (args.focus !== undefined) data.focus = args.focus
      if (args.habitPercent !== undefined) data.habitPercent = args.habitPercent
      const review = await prisma.weeklyReview.update({ where: { id: args.reviewId as string }, data })
      return { success: true, data: review }
    },
  },
  {
    name: "delete_weekly_review",
    description: "Delete a weekly review.",
    parameters: {
      reviewId: { type: "string", description: "Weekly review ID", required: true },
    },
    handler: async (args) => {
      await prisma.weeklyReview.delete({ where: { id: args.reviewId as string } })
      return { success: true, data: { deleted: true } }
    },
  },
]
