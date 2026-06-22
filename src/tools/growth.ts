import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const growthTools: ToolDef[] = [
  // ── Arabic Sessions ──
  {
    name: "query_arabic_sessions",
    description: "Get Arabic learning session history.",
    parameters: {
      type: { type: "string", description: "Filter by type", enum: ["duo", "quran", "video", "speak"] },
      limit: { type: "number", description: "Max results (default 20)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.type) where.type = args.type as string
      const sessions = await prisma.arabicSession.findMany({
        where,
        orderBy: { date: "desc" },
        take: (args.limit as number) ?? 20,
      })
      return { success: true, data: sessions }
    },
  },
  {
    name: "create_arabic_session",
    description: "Log an Arabic learning session.",
    parameters: {
      type: { type: "string", description: "Session type", enum: ["duo", "quran", "video", "speak"], required: true },
      duration: { type: "number", description: "Duration in minutes", required: true },
      notes: { type: "string", description: "What you practiced or learned" },
    },
    handler: async (args) => {
      const session = await prisma.arabicSession.create({
        data: {
          type: args.type as string,
          duration: args.duration as number,
          notes: (args.notes as string) ?? null,
        },
      })
      return { success: true, data: session }
    },
  },
  {
    name: "update_arabic_session",
    description: "Update a logged Arabic session.",
    parameters: {
      sessionId: { type: "string", description: "Session ID", required: true },
      type: { type: "string", description: "Updated type", enum: ["duo", "quran", "video", "speak"] },
      duration: { type: "number", description: "Updated duration" },
      notes: { type: "string", description: "Updated notes" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.type) data.type = args.type
      if (args.duration !== undefined) data.duration = args.duration
      if (args.notes !== undefined) data.notes = args.notes
      const session = await prisma.arabicSession.update({ where: { id: args.sessionId as string }, data })
      return { success: true, data: session }
    },
  },
  {
    name: "delete_arabic_session",
    description: "Delete an Arabic session entry.",
    parameters: {
      sessionId: { type: "string", description: "Session ID", required: true },
    },
    handler: async (args) => {
      await prisma.arabicSession.delete({ where: { id: args.sessionId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Grades ──
  {
    name: "query_grades",
    description: "Get course grades, optionally filtered by semester.",
    parameters: {
      semester: { type: "string", description: "Filter by semester (e.g. 2025/2026)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.semester) where.semester = args.semester as string
      const grades = await prisma.grade.findMany({ where, orderBy: [{ semester: "desc" }, { courseCode: "asc" }] })
      return { success: true, data: grades }
    },
  },
  {
    name: "create_grade",
    description: "Add a course grade entry.",
    parameters: {
      courseCode: { type: "string", description: "Course code (e.g. DIT123)", required: true },
      courseName: { type: "string", description: "Course name", required: true },
      instructor: { type: "string", description: "Instructor name" },
      semester: { type: "string", description: "Semester (default 2025/2026)" },
    },
    handler: async (args) => {
      const grade = await prisma.grade.create({
        data: {
          courseCode: args.courseCode as string,
          courseName: args.courseName as string,
          instructor: (args.instructor as string) ?? null,
          semester: (args.semester as string) ?? "2025/2026",
        },
      })
      return { success: true, data: grade }
    },
  },
  {
    name: "update_grade",
    description: "Update course scores (assignment, midterm, exam, total) and target.",
    parameters: {
      gradeId: { type: "string", description: "Grade ID", required: true },
      assignment: { type: "number", description: "Assignment score" },
      midterm: { type: "number", description: "Midterm score" },
      exam: { type: "number", description: "Exam score" },
      total: { type: "number", description: "Total score" },
      targetExam: { type: "number", description: "Target exam score needed" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.assignment !== undefined) data.assignment = args.assignment
      if (args.midterm !== undefined) data.midterm = args.midterm
      if (args.exam !== undefined) data.exam = args.exam
      if (args.total !== undefined) data.total = args.total
      if (args.targetExam !== undefined) data.targetExam = args.targetExam
      const grade = await prisma.grade.update({ where: { id: args.gradeId as string }, data })
      return { success: true, data: grade }
    },
  },
  {
    name: "delete_grade",
    description: "Delete a grade entry.",
    parameters: {
      gradeId: { type: "string", description: "Grade ID", required: true },
    },
    handler: async (args) => {
      await prisma.grade.delete({ where: { id: args.gradeId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Learning Progress ──
  {
    name: "create_learning_progress",
    description: "Log progress on a learning track task.",
    parameters: {
      track: { type: "string", description: "Learning track (coding, figma, english, aiguang, reading)", required: true },
      taskName: { type: "string", description: "Task or concept completed", required: true },
      phase: { type: "string", description: "Phase within the track" },
      notes: { type: "string", description: "Reflection notes" },
    },
    handler: async (args) => {
      const progress = await prisma.learningProgress.create({
        data: {
          track: args.track as string,
          taskName: args.taskName as string,
          phase: (args.phase as string) ?? null,
          notes: (args.notes as string) ?? null,
          completedAt: new Date(),
        },
      })
      return { success: true, data: progress }
    },
  },
  {
    name: "update_learning_progress",
    description: "Update a learning progress entry.",
    parameters: {
      progressId: { type: "string", description: "Progress entry ID", required: true },
      taskName: { type: "string", description: "Updated task name" },
      notes: { type: "string", description: "Updated notes" },
      completedAt: { type: "string", description: "ISO date when completed" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.taskName) data.taskName = args.taskName
      if (args.notes !== undefined) data.notes = args.notes
      if (args.completedAt) data.completedAt = new Date(args.completedAt as string)
      const progress = await prisma.learningProgress.update({ where: { id: args.progressId as string }, data })
      return { success: true, data: progress }
    },
  },
  {
    name: "delete_learning_progress",
    description: "Delete a learning progress entry.",
    parameters: {
      progressId: { type: "string", description: "Progress entry ID", required: true },
    },
    handler: async (args) => {
      await prisma.learningProgress.delete({ where: { id: args.progressId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Skill Ratings ──
  {
    name: "query_skill_ratings",
    description: "Get all skill ratings, optionally filtered by category.",
    parameters: {
      category: { type: "string", description: "Filter by category", enum: ["dev", "design", "language", "business"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.category) where.category = args.category as string
      const skills = await prisma.skillRating.findMany({ where, orderBy: { name: "asc" } })
      return { success: true, data: skills }
    },
  },
  {
    name: "create_skill_rating",
    description: "Add a new skill to rate.",
    parameters: {
      name: { type: "string", description: "Skill name", required: true },
      rating: { type: "number", description: "Rating 1-10", required: true },
      category: { type: "string", description: "Category", enum: ["dev", "design", "language", "business"] },
    },
    handler: async (args) => {
      const skill = await prisma.skillRating.create({
        data: {
          name: args.name as string,
          rating: args.rating as number,
          category: (args.category as string) ?? null,
        },
      })
      return { success: true, data: skill }
    },
  },
  {
    name: "update_skill_rating",
    description: "Update a skill's rating or category.",
    parameters: {
      skillId: { type: "string", description: "Skill ID", required: true },
      rating: { type: "number", description: "New rating 1-10" },
      category: { type: "string", description: "New category", enum: ["dev", "design", "language", "business"] },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.rating !== undefined) data.rating = args.rating
      if (args.category !== undefined) data.category = args.category
      const skill = await prisma.skillRating.update({ where: { id: args.skillId as string }, data })
      return { success: true, data: skill }
    },
  },
  {
    name: "delete_skill_rating",
    description: "Delete a skill rating.",
    parameters: {
      skillId: { type: "string", description: "Skill ID", required: true },
    },
    handler: async (args) => {
      await prisma.skillRating.delete({ where: { id: args.skillId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Trajectory Milestones ──
  {
    name: "query_trajectory_milestones",
    description: "Get career trajectory milestones by time period.",
    parameters: {
      year: { type: "string", description: "Filter by period", enum: ["year1", "year2", "year3", "year5", "year10"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.year) where.year = args.year as string
      const milestones = await prisma.trajectoryMilestone.findMany({ where, orderBy: { sortOrder: "asc" } })
      return { success: true, data: milestones }
    },
  },
  {
    name: "create_trajectory_milestone",
    description: "Add a career trajectory milestone.",
    parameters: {
      year: { type: "string", description: "Time period", enum: ["year1", "year2", "year3", "year5", "year10"], required: true },
      label: { type: "string", description: "Milestone label", required: true },
      target: { type: "string", description: "What to achieve" },
      income: { type: "string", description: "Target income" },
      isCurrent: { type: "boolean", description: "Mark as current focus" },
    },
    handler: async (args) => {
      const milestone = await prisma.trajectoryMilestone.create({
        data: {
          year: args.year as string,
          label: args.label as string,
          target: (args.target as string) ?? null,
          income: (args.income as string) ?? null,
          isCurrent: (args.isCurrent as boolean) ?? false,
        },
      })
      return { success: true, data: milestone }
    },
  },
  {
    name: "update_trajectory_milestone",
    description: "Update a career milestone.",
    parameters: {
      milestoneId: { type: "string", description: "Milestone ID", required: true },
      label: { type: "string", description: "Updated label" },
      target: { type: "string", description: "Updated target" },
      income: { type: "string", description: "Updated income target" },
      isCurrent: { type: "boolean", description: "Mark as current focus" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.label) data.label = args.label
      if (args.target !== undefined) data.target = args.target
      if (args.income !== undefined) data.income = args.income
      if (args.isCurrent !== undefined) data.isCurrent = args.isCurrent
      const milestone = await prisma.trajectoryMilestone.update({ where: { id: args.milestoneId as string }, data })
      return { success: true, data: milestone }
    },
  },
  {
    name: "delete_trajectory_milestone",
    description: "Delete a trajectory milestone.",
    parameters: {
      milestoneId: { type: "string", description: "Milestone ID", required: true },
    },
    handler: async (args) => {
      await prisma.trajectoryMilestone.delete({ where: { id: args.milestoneId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Growth Milestones ──
  {
    name: "query_growth_milestones",
    description: "List growth/roadmap milestones by period.",
    parameters: {
      period: { type: "string", description: "Filter by period (e.g. month1-2, year2)" },
      isComplete: { type: "boolean", description: "Filter by completion status" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.period) where.period = args.period as string
      if (args.isComplete !== undefined) where.isComplete = args.isComplete as boolean
      const milestones = await prisma.growthMilestone.findMany({ where, orderBy: { sortOrder: "asc" } })
      return { success: true, data: milestones }
    },
  },
  {
    name: "create_growth_milestone",
    description: "Add a growth/roadmap milestone.",
    parameters: {
      period: { type: "string", description: "Time period (e.g. month1-2, year2)", required: true },
      title: { type: "string", description: "Milestone title", required: true },
      targetIncome: { type: "string", description: "Target income for this period" },
      items: { type: "string", description: "Comma-separated list of items to achieve" },
    },
    handler: async (args) => {
      const items = (args.items as string) ? (args.items as string).split(",").map((s: string) => s.trim()) : []
      const milestone = await prisma.growthMilestone.create({
        data: {
          period: args.period as string,
          title: args.title as string,
          targetIncome: (args.targetIncome as string) ?? null,
          items,
        },
      })
      return { success: true, data: milestone }
    },
  },
  {
    name: "update_growth_milestone",
    description: "Update a growth milestone's status, items, or income target.",
    parameters: {
      milestoneId: { type: "string", description: "Milestone ID", required: true },
      title: { type: "string", description: "Updated title" },
      targetIncome: { type: "string", description: "Updated income target" },
      items: { type: "string", description: "Comma-separated updated items" },
      isComplete: { type: "boolean", description: "Mark as complete or not" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.title) data.title = args.title
      if (args.targetIncome !== undefined) data.targetIncome = args.targetIncome
      if (args.items) data.items = (args.items as string).split(",").map((s: string) => s.trim())
      if (args.isComplete !== undefined) {
        data.isComplete = args.isComplete as boolean
        if (args.isComplete) data.completedAt = new Date()
      }
      const milestone = await prisma.growthMilestone.update({ where: { id: args.milestoneId as string }, data })
      return { success: true, data: milestone }
    },
  },
  {
    name: "delete_growth_milestone",
    description: "Delete a growth milestone.",
    parameters: {
      milestoneId: { type: "string", description: "Milestone ID", required: true },
    },
    handler: async (args) => {
      await prisma.growthMilestone.delete({ where: { id: args.milestoneId as string } })
      return { success: true, data: { deleted: true } }
    },
  },
]
