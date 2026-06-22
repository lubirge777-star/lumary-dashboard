import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const mediaContentTools: ToolDef[] = [
  // ── Content Calendar ──
  {
    name: "query_content_calendar",
    description: "List content calendar entries with filters.",
    parameters: {
      platform: { type: "string", description: "Filter by platform", enum: ["tiktok", "instagram", "facebook", "youtube", "whatsapp"] },
      status: { type: "string", description: "Filter by status", enum: ["draft", "scheduled", "posted", "cancelled"] },
      limit: { type: "number", description: "Max results (default 50)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.platform) where.platform = args.platform as string
      if (args.status) where.status = args.status as string
      const entries = await prisma.contentCalendar.findMany({
        where,
        orderBy: { scheduledFor: "asc" },
        take: (args.limit as number) ?? 50,
      })
      return { success: true, data: entries }
    },
  },
  {
    name: "create_content_entry",
    description: "Schedule a new content post.",
    parameters: {
      platform: { type: "string", description: "Platform to post on", enum: ["tiktok", "instagram", "facebook", "youtube", "whatsapp"], required: true },
      contentText: { type: "string", description: "Content text or script" },
      caption: { type: "string", description: "Post caption" },
      hashtags: { type: "string", description: "Comma-separated hashtags" },
      scheduledFor: { type: "string", description: "ISO date when to post", required: true },
      pillar: { type: "string", description: "Content pillar (portfolio, education, personal, engagement)" },
    },
    handler: async (args) => {
      const entry = await prisma.contentCalendar.create({
        data: {
          platform: args.platform as string,
          contentText: (args.contentText as string) ?? null,
          caption: (args.caption as string) ?? null,
          hashtags: (args.hashtags as string) ?? null,
          scheduledFor: new Date(args.scheduledFor as string),
          pillar: (args.pillar as string) ?? null,
        },
      })
      return { success: true, data: entry }
    },
  },
  {
    name: "update_content_entry",
    description: "Update a scheduled content entry.",
    parameters: {
      entryId: { type: "string", description: "Content entry ID", required: true },
      contentText: { type: "string", description: "Updated content" },
      caption: { type: "string", description: "Updated caption" },
      hashtags: { type: "string", description: "Updated hashtags" },
      scheduledFor: { type: "string", description: "Reschedule date (ISO)" },
      status: { type: "string", description: "Update status", enum: ["draft", "scheduled", "posted", "cancelled"] },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.contentText !== undefined) data.contentText = args.contentText
      if (args.caption !== undefined) data.caption = args.caption
      if (args.hashtags !== undefined) data.hashtags = args.hashtags
      if (args.scheduledFor) data.scheduledFor = new Date(args.scheduledFor as string)
      if (args.status) {
        data.status = args.status
        if (args.status === "posted") data.postedAt = new Date()
      }
      const entry = await prisma.contentCalendar.update({ where: { id: args.entryId as string }, data })
      return { success: true, data: entry }
    },
  },
  {
    name: "delete_content_entry",
    description: "Delete a content calendar entry.",
    parameters: {
      entryId: { type: "string", description: "Content entry ID", required: true },
    },
    handler: async (args) => {
      await prisma.contentCalendar.delete({ where: { id: args.entryId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Movies ──
  {
    name: "query_movies",
    description: "List movies from the tracker, optionally by category or watched status.",
    parameters: {
      category: { type: "string", description: "Filter by category", enum: ["mcu", "datenight"] },
      watched: { type: "boolean", description: "Filter by watched status" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.category) where.category = args.category as string
      if (args.watched !== undefined) where.watched = args.watched as boolean
      const movies = await prisma.movie.findMany({
        where,
        orderBy: [{ year: "asc" }, { title: "asc" }],
      })
      return { success: true, data: movies }
    },
  },
  {
    name: "create_movie",
    description: "Add a movie to the tracker.",
    parameters: {
      key: { type: "string", description: "Unique key (e.g. avengers-endgame)", required: true },
      title: { type: "string", description: "Movie title", required: true },
      year: { type: "number", description: "Release year", required: true },
      category: { type: "string", description: "Category", enum: ["mcu", "datenight"] },
      saga: { type: "string", description: "MCU saga name" },
      phase: { type: "string", description: "MCU phase" },
      withMary: { type: "boolean", description: "Date night with Mary" },
    },
    handler: async (args) => {
      const movie = await prisma.movie.create({
        data: {
          key: args.key as string,
          title: args.title as string,
          year: args.year as number,
          category: (args.category as string) ?? "mcu",
          saga: (args.saga as string) ?? null,
          phase: (args.phase as string) ?? null,
          withMary: (args.withMary as boolean) ?? false,
        },
      })
      return { success: true, data: movie }
    },
  },
  {
    name: "update_movie",
    description: "Update movie details or mark as watched.",
    parameters: {
      movieId: { type: "string", description: "Movie ID", required: true },
      watched: { type: "boolean", description: "Mark as watched or unwatched" },
      rewatch: { type: "boolean", description: "Mark as rewatch" },
      withMary: { type: "boolean", description: "Watched with Mary" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.watched !== undefined) data.watched = args.watched
      if (args.rewatch !== undefined) data.rewatch = args.rewatch
      if (args.withMary !== undefined) data.withMary = args.withMary
      const movie = await prisma.movie.update({ where: { id: args.movieId as string }, data })
      return { success: true, data: movie }
    },
  },
  {
    name: "delete_movie",
    description: "Delete a movie from the tracker.",
    parameters: {
      movieId: { type: "string", description: "Movie ID", required: true },
    },
    handler: async (args) => {
      await prisma.movie.delete({ where: { id: args.movieId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Reading Sessions ──
  {
    name: "query_reading_sessions",
    description: "Get reading session history, optionally by book.",
    parameters: {
      bookId: { type: "string", description: "Filter by book ID" },
      limit: { type: "number", description: "Max results (default 20)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.bookId) where.bookId = args.bookId as string
      const sessions = await prisma.readingSession.findMany({
        where,
        orderBy: { date: "desc" },
        take: (args.limit as number) ?? 20,
        include: { book: { select: { title: true } } },
      })
      return { success: true, data: sessions }
    },
  },
  {
    name: "create_reading_session",
    description: "Log a reading session (pages read).",
    parameters: {
      bookId: { type: "string", description: "Book ID", required: true },
      pagesRead: { type: "number", description: "Number of pages read", required: true },
    },
    handler: async (args) => {
      const session = await prisma.readingSession.create({
        data: {
          bookId: args.bookId as string,
          pagesRead: args.pagesRead as number,
        },
      })
      return { success: true, data: session }
    },
  },
  {
    name: "delete_reading_session",
    description: "Delete a reading session entry.",
    parameters: {
      sessionId: { type: "string", description: "Session ID", required: true },
    },
    handler: async (args) => {
      await prisma.readingSession.delete({ where: { id: args.sessionId as string } })
      return { success: true, data: { deleted: true } }
    },
  },
]
