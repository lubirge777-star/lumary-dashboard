import { prisma } from "@/lib/prisma"
import type { ToolDef } from "./types"

export const businessGrowthTools: ToolDef[] = [
  // ── Routine Supervision ──
  {
    name: "query_routine_slots",
    description: "List all routine schedule slots for a given day.",
    parameters: {
      dayOfWeek: { type: "number", description: "0=Sunday, 1=Monday..6=Saturday (omit for everyday slots)" },
    },
    handler: async (args) => {
      const where: any = { isActive: true }
      if (args.dayOfWeek !== undefined) {
        where.OR = [
          { dayOfWeek: args.dayOfWeek as number },
          { dayOfWeek: null },
        ]
      }
      const slots = await prisma.routineSlot.findMany({ where, orderBy: { sortOrder: "asc" } })
      return { success: true, data: slots }
    },
  },
  {
    name: "create_routine_slot",
    description: "Add a scheduled routine activity (e.g. 06:00 English shadowing).",
    parameters: {
      time: { type: "string", description: "Time in HH:mm format (e.g. 06:00)", required: true },
      label: { type: "string", description: "Activity label (e.g. English shadowing)", required: true },
      duration: { type: "number", description: "Duration in minutes", required: true },
      dayOfWeek: { type: "number", description: "0=Sun..6=Sat, omit for daily" },
      sortOrder: { type: "number", description: "Display order" },
    },
    handler: async (args) => {
      const slot = await prisma.routineSlot.create({
        data: {
          time: args.time as string,
          label: args.label as string,
          duration: args.duration as number,
          dayOfWeek: (args.dayOfWeek as number) ?? null,
          sortOrder: (args.sortOrder as number) ?? 0,
        },
      })
      return { success: true, data: slot }
    },
  },
  {
    name: "update_routine_slot",
    description: "Update a routine slot's time, label, or duration.",
    parameters: {
      slotId: { type: "string", description: "Routine slot ID", required: true },
      time: { type: "string", description: "Updated time" },
      label: { type: "string", description: "Updated label" },
      duration: { type: "number", description: "Updated duration" },
      isActive: { type: "boolean", description: "Enable or disable this slot" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.time) data.time = args.time
      if (args.label) data.label = args.label
      if (args.duration !== undefined) data.duration = args.duration
      if (args.isActive !== undefined) data.isActive = args.isActive
      const slot = await prisma.routineSlot.update({ where: { id: args.slotId as string }, data })
      return { success: true, data: slot }
    },
  },
  {
    name: "log_routine_completion",
    description: "Mark a routine slot as done for today with optional actual duration.",
    parameters: {
      slotId: { type: "string", description: "Routine slot ID", required: true },
      completed: { type: "boolean", description: "Did you complete it?" },
      durationActual: { type: "number", description: "Actual minutes spent" },
      notes: { type: "string", description: "Notes about the session" },
    },
    handler: async (args) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const existing = await prisma.routineLog.findUnique({
        where: { slotId_date: { slotId: args.slotId as string, date: today } },
      })
      if (existing) {
        const log = await prisma.routineLog.update({
          where: { id: existing.id },
          data: {
            completed: (args.completed as boolean) ?? existing.completed,
            durationActual: (args.durationActual as number) ?? existing.durationActual,
            notes: (args.notes as string) ?? existing.notes,
          },
        })
        return { success: true, data: log }
      }
      const log = await prisma.routineLog.create({
        data: {
          slotId: args.slotId as string,
          date: today,
          completed: (args.completed as boolean) ?? true,
          durationActual: (args.durationActual as number) ?? null,
          notes: (args.notes as string) ?? null,
        },
      })
      return { success: true, data: log }
    },
  },
  {
    name: "get_today_routine_status",
    description: "Get today's routine — which slots are done, which are pending, and actual time spent.",
    parameters: {},
    handler: async () => {
      const dayOfWeek = new Date().getDay()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const slots = await prisma.routineSlot.findMany({
        where: {
          isActive: true,
          OR: [{ dayOfWeek }, { dayOfWeek: null }],
        },
        orderBy: { sortOrder: "asc" },
      })
      const logs = await prisma.routineLog.findMany({
        where: { date: { gte: today } },
        select: { slotId: true, completed: true, durationActual: true },
      })
      const logMap = new Map(logs.map((l) => [l.slotId, l]))
      const totalPlanned = slots.reduce((s, x) => s + x.duration, 0)
      const totalActual = logs.reduce((s, x) => s + (x.durationActual ?? 0), 0)
      const doneCount = logs.filter((l) => l.completed).length
      return {
        success: true,
        data: {
          date: today.toISOString(),
          slots: slots.map((s) => ({
            id: s.id,
            time: s.time,
            label: s.label,
            duration: s.duration,
            done: logMap.get(s.id)?.completed ?? false,
            actualMinutes: logMap.get(s.id)?.durationActual ?? null,
          })),
          summary: {
            totalSlots: slots.length,
            doneCount,
            pendingCount: slots.length - doneCount,
            totalPlannedMinutes: totalPlanned,
            totalActualMinutes: totalActual,
            adherencePercent: totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0,
          },
        },
      }
    },
  },

  // ── Social Media Posts ──
  {
    name: "query_social_posts",
    description: "List social media posts filtered by platform, pillar, or status.",
    parameters: {
      platform: { type: "string", description: "tiktok, instagram, facebook, youtube, whatsapp" },
      pillar: { type: "string", description: "portfolio, education, personal, engagement" },
      status: { type: "string", description: "draft, scheduled, posted" },
      limit: { type: "number", description: "Max results (default 50)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.platform) where.platform = args.platform as string
      if (args.pillar) where.pillar = args.pillar as string
      if (args.status) where.status = args.status as string
      const posts = await prisma.socialMediaPost.findMany({
        where,
        orderBy: { postedAt: "desc" },
        take: (args.limit as number) ?? 50,
      })
      return { success: true, data: posts }
    },
  },
  {
    name: "create_social_post",
    description: "Log a new social media post to track content strategy and analytics.",
    parameters: {
      platform: { type: "string", description: "Platform", enum: ["tiktok", "instagram", "facebook", "youtube", "whatsapp"], required: true },
      pillar: { type: "string", description: "Content pillar", enum: ["portfolio", "education", "personal", "engagement"], required: true },
      contentType: { type: "string", description: "Content format", enum: ["reel", "carousel", "story", "feed", "status"], required: true },
      title: { type: "string", description: "Post title or description" },
      scheduledFor: { type: "string", description: "ISO date when scheduled" },
      status: { type: "string", description: "Status", enum: ["draft", "scheduled", "posted"] },
    },
    handler: async (args) => {
      const post = await prisma.socialMediaPost.create({
        data: {
          platform: args.platform as string,
          pillar: args.pillar as string,
          contentType: args.contentType as string,
          title: (args.title as string) ?? null,
          scheduledFor: args.scheduledFor ? new Date(args.scheduledFor as string) : null,
          status: (args.status as string) ?? "draft",
        },
      })
      return { success: true, data: post }
    },
  },
  {
    name: "update_social_post",
    description: "Update a social post's status, analytics, or content URL.",
    parameters: {
      postId: { type: "string", description: "Post ID", required: true },
      status: { type: "string", description: "New status", enum: ["draft", "scheduled", "posted"] },
      views: { type: "number", description: "View count" },
      likes: { type: "number", description: "Like count" },
      comments: { type: "number", description: "Comment count" },
      saves: { type: "number", description: "Save count" },
      shares: { type: "number", description: "Share count" },
      dmsReceived: { type: "number", description: "DMs received from this post" },
      contentUrl: { type: "string", description: "Link to the live post" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.status) {
        data.status = args.status
        if (args.status === "posted") data.postedAt = new Date()
      }
      if (args.views !== undefined) data.views = args.views
      if (args.likes !== undefined) data.likes = args.likes
      if (args.comments !== undefined) data.comments = args.comments
      if (args.saves !== undefined) data.saves = args.saves
      if (args.shares !== undefined) data.shares = args.shares
      if (args.dmsReceived !== undefined) data.dmsReceived = args.dmsReceived
      if (args.contentUrl !== undefined) data.contentUrl = args.contentUrl
      const post = await prisma.socialMediaPost.update({ where: { id: args.postId as string }, data })
      return { success: true, data: post }
    },
  },
  {
    name: "delete_social_post",
    description: "Delete a social media post entry.",
    parameters: {
      postId: { type: "string", description: "Post ID", required: true },
    },
    handler: async (args) => {
      await prisma.socialMediaPost.delete({ where: { id: args.postId as string } })
      return { success: true, data: { deleted: true } }
    },
  },
  {
    name: "get_social_media_summary",
    description: "Get a weekly content summary: posts per pillar, platform breakdown, total engagement.",
    parameters: {
      days: { type: "number", description: "Number of days to look back (default 7)" },
    },
    handler: async (args) => {
      const since = new Date()
      since.setDate(since.getDate() - ((args.days as number) ?? 7))
      const posts = await prisma.socialMediaPost.findMany({
        where: { postedAt: { gte: since } },
        orderBy: { postedAt: "desc" },
      })
      const byPillar: Record<string, number> = {}
      const byPlatform: Record<string, number> = {}
      let totalViews = 0, totalLikes = 0, totalComments = 0, totalDMs = 0
      for (const p of posts) {
        byPillar[p.pillar] = (byPillar[p.pillar] || 0) + 1
        byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1
        totalViews += p.views
        totalLikes += p.likes
        totalComments += p.comments
        totalDMs += p.dmsReceived
      }
      return {
        success: true,
        data: {
          period: `${since.toISOString()} to now`,
          totalPosts: posts.length,
          byPillar,
          byPlatform,
          totalViews,
          totalLikes,
          totalComments,
          totalDMs,
        },
      }
    },
  },

  // ── Social Media Collabs ──
  {
    name: "query_collabs",
    description: "List collaboration partnerships with other creators.",
    parameters: {
      platform: { type: "string", description: "Filter by platform", enum: ["tiktok", "instagram", "facebook"] },
      accepted: { type: "boolean", description: "Filter by acceptance status" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.platform) where.platform = args.platform as string
      if (args.accepted !== undefined) where.accepted = args.accepted as boolean
      const collabs = await prisma.socialMediaCollab.findMany({ where, orderBy: { createdAt: "desc" } })
      return { success: true, data: collabs }
    },
  },
  {
    name: "create_collab",
    description: "Log a collaboration outreach or partnership.",
    parameters: {
      partnerName: { type: "string", description: "Creator's name", required: true },
      partnerHandle: { type: "string", description: "Their handle on the platform" },
      platform: { type: "string", description: "Platform", enum: ["tiktok", "instagram", "facebook"], required: true },
      followerCount: { type: "number", description: "Their follower count" },
      offer: { type: "string", description: "What you offered them", required: true },
    },
    handler: async (args) => {
      const collab = await prisma.socialMediaCollab.create({
        data: {
          partnerName: args.partnerName as string,
          partnerHandle: (args.partnerHandle as string) ?? null,
          platform: args.platform as string,
          followerCount: (args.followerCount as number) ?? null,
          offer: args.offer as string,
        },
      })
      return { success: true, data: collab }
    },
  },
  {
    name: "update_collab",
    description: "Update collab status — mark as accepted, posted, or converted to client.",
    parameters: {
      collabId: { type: "string", description: "Collab ID", required: true },
      accepted: { type: "boolean", description: "Did they accept?" },
      deliverables: { type: "string", description: "What was delivered" },
      postedAt: { type: "string", description: "ISO date when posted" },
      convertedToClient: { type: "boolean", description: "Became a paying client?" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.accepted !== undefined) data.accepted = args.accepted
      if (args.deliverables !== undefined) data.deliverables = args.deliverables
      if (args.postedAt) data.postedAt = new Date(args.postedAt as string)
      if (args.convertedToClient !== undefined) data.convertedToClient = args.convertedToClient
      const collab = await prisma.socialMediaCollab.update({ where: { id: args.collabId as string }, data })
      return { success: true, data: collab }
    },
  },
  {
    name: "delete_collab",
    description: "Delete a collab entry.",
    parameters: {
      collabId: { type: "string", description: "Collab ID", required: true },
    },
    handler: async (args) => {
      await prisma.socialMediaCollab.delete({ where: { id: args.collabId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Checklist System ──
  {
    name: "query_checklist_items",
    description: "Get all checklist items for a category (legal_setup, weekly_admin, monthly_review, business_startup).",
    parameters: {
      category: { type: "string", description: "Checklist category", required: true, enum: ["legal_setup", "weekly_admin", "monthly_review", "business_startup"] },
    },
    handler: async (args) => {
      const items = await prisma.checklistItem.findMany({
        where: { category: args.category as string },
        orderBy: { sortOrder: "asc" },
        include: { completions: { orderBy: { completedAt: "desc" }, take: 1 } },
      })
      return {
        success: true,
        data: items.map((i) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          isRequired: i.isRequired,
          done: i.completions.length > 0,
          lastCompleted: i.completions[0]?.completedAt ?? null,
        })),
      }
    },
  },
  {
    name: "create_checklist_item",
    description: "Add a new checklist item for tracking business setup or admin tasks.",
    parameters: {
      category: { type: "string", description: "Category", enum: ["legal_setup", "weekly_admin", "monthly_review", "business_startup"], required: true },
      title: { type: "string", description: "Item title", required: true },
      description: { type: "string", description: "Details about this item" },
      isRequired: { type: "boolean", description: "Is this mandatory?" },
    },
    handler: async (args) => {
      const item = await prisma.checklistItem.create({
        data: {
          category: args.category as string,
          title: args.title as string,
          description: (args.description as string) ?? null,
          isRequired: (args.isRequired as boolean) ?? true,
        },
      })
      return { success: true, data: item }
    },
  },
  {
    name: "complete_checklist_item",
    description: "Mark a checklist item as done (adds a completion record).",
    parameters: {
      itemId: { type: "string", description: "Checklist item ID", required: true },
      notes: { type: "string", description: "Notes about completion" },
    },
    handler: async (args) => {
      const completion = await prisma.checklistCompletion.create({
        data: {
          itemId: args.itemId as string,
          notes: (args.notes as string) ?? null,
        },
      })
      return { success: true, data: completion }
    },
  },
  {
    name: "update_checklist_item",
    description: "Update a checklist item title, description, or category.",
    parameters: {
      itemId: { type: "string", description: "Item ID", required: true },
      title: { type: "string", description: "Updated title" },
      description: { type: "string", description: "Updated description" },
      isRequired: { type: "boolean", description: "Required or optional" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.title) data.title = args.title
      if (args.description !== undefined) data.description = args.description
      if (args.isRequired !== undefined) data.isRequired = args.isRequired
      const item = await prisma.checklistItem.update({ where: { id: args.itemId as string }, data })
      return { success: true, data: item }
    },
  },
  {
    name: "delete_checklist_item",
    description: "Delete a checklist item and its completions.",
    parameters: {
      itemId: { type: "string", description: "Item ID", required: true },
    },
    handler: async (args) => {
      await prisma.checklistItem.delete({ where: { id: args.itemId as string } })
      return { success: true, data: { deleted: true } }
    },
  },

  // ── Referral Tracking ──
  {
    name: "query_referrals",
    description: "List client referrals, optionally by status.",
    parameters: {
      clientId: { type: "string", description: "Filter by referring client ID" },
      status: { type: "string", description: "Filter by status", enum: ["asked", "connected", "converted", "closed"] },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.clientId) where.clientId = args.clientId as string
      if (args.status) where.status = args.status as string
      const referrals = await prisma.referral.findMany({
        where,
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: referrals }
    },
  },
  {
    name: "create_referral",
    description: "Log a referral request made to a client.",
    parameters: {
      clientId: { type: "string", description: "Client who was asked", required: true },
      referredName: { type: "string", description: "Name of the person referred" },
      referredPhone: { type: "string", description: "Phone of the person referred" },
    },
    handler: async (args) => {
      const referral = await prisma.referral.create({
        data: {
          clientId: args.clientId as string,
          referredName: (args.referredName as string) ?? null,
          referredPhone: (args.referredPhone as string) ?? null,
        },
      })
      return { success: true, data: referral }
    },
  },
  {
    name: "update_referral",
    description: "Update referral status (asked → connected → converted → closed).",
    parameters: {
      referralId: { type: "string", description: "Referral ID", required: true },
      status: { type: "string", description: "New status", enum: ["asked", "connected", "converted", "closed"] },
      notes: { type: "string", description: "Notes about progress" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.status) data.status = args.status
      if (args.notes !== undefined) data.notes = args.notes
      const referral = await prisma.referral.update({ where: { id: args.referralId as string }, data })
      return { success: true, data: referral }
    },
  },

  // ── Product Transition ──
  {
    name: "get_product_transition_status",
    description: "Get the current product transition stage and all stage history.",
    parameters: {},
    handler: async () => {
      const stages = await prisma.productTransition.findMany({
        orderBy: { startedAt: "desc" },
      })
      const current = stages.find((s) => s.isCurrent)
      return { success: true, data: { currentStage: current ?? null, history: stages } }
    },
  },
  {
    name: "advance_product_transition",
    description: "Advance to the next product transition stage (services → productized → wedge → scale).",
    parameters: {
      stage: { type: "string", description: "Stage to advance to", enum: ["services", "productized", "wedge", "scale"], required: true },
      metrics: { type: "string", description: "JSON with { income, keyMetric, exitCondition }" },
      notes: { type: "string", description: "Notes about this transition" },
    },
    handler: async (args) => {
      await prisma.productTransition.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      })
      const transition = await prisma.productTransition.create({
        data: {
          stage: args.stage as string,
          metrics: args.metrics ? JSON.parse(args.metrics as string) : null,
          notes: (args.notes as string) ?? null,
          isCurrent: true,
        },
      })
      return { success: true, data: transition }
    },
  },
  {
    name: "update_product_transition",
    description: "Update the current transition stage's metrics or notes.",
    parameters: {
      transitionId: { type: "string", description: "Transition ID", required: true },
      metrics: { type: "string", description: "JSON metrics update" },
      notes: { type: "string", description: "Updated notes" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.metrics) data.metrics = JSON.parse(args.metrics as string)
      if (args.notes !== undefined) data.notes = args.notes
      const transition = await prisma.productTransition.update({ where: { id: args.transitionId as string }, data })
      return { success: true, data: transition }
    },
  },

  // ── Enhanced Skill Management ──
  {
    name: "query_full_skill_matrix",
    description: "Get the full skills matrix with ratings, gaps, learning resources, and tiers.",
    parameters: {
      category: { type: "string", description: "Filter by category", enum: ["dev", "design", "language", "business"] },
      tier: { type: "number", description: "Filter by priority tier (1-4)" },
    },
    handler: async (args) => {
      const where: any = {}
      if (args.category) where.category = args.category as string
      if (args.tier !== undefined) where.tier = args.tier as number
      const skills = await prisma.skillRating.findMany({ where, orderBy: [{ category: "asc" }, { name: "asc" }] })
      return { success: true, data: skills }
    },
  },
  {
    name: "update_skill_matrix",
    description: "Update a skill's rating, gap percentage, learning resources, tier, or notes.",
    parameters: {
      skillId: { type: "string", description: "Skill ID", required: true },
      rating: { type: "number", description: "Current level 1-10" },
      category: { type: "string", description: "Skill category", enum: ["dev", "design", "language", "business"] },
      tier: { type: "number", description: "Priority tier 1-4 (1=highest)" },
      gap: { type: "string", description: "Describe what needs improvement" },
      resources: { type: "string", description: "Learning resources to close the gap" },
      notes: { type: "string", description: "Additional notes" },
    },
    handler: async (args) => {
      const data: any = {}
      if (args.rating !== undefined) data.rating = args.rating
      if (args.category) data.category = args.category
      if (args.tier !== undefined) data.tier = args.tier
      if (args.gap !== undefined) data.gap = args.gap
      if (args.resources !== undefined) data.resources = args.resources
      if (args.notes !== undefined) data.notes = args.notes
      const skill = await prisma.skillRating.update({ where: { id: args.skillId as string }, data })
      return { success: true, data: skill }
    },
  },
  {
    name: "seed_default_routine",
    description: "Seed the default daily routine from the business spec (Fajr, English, coding, etc.). Run once to set up.",
    parameters: {},
    handler: async () => {
      const existing = await prisma.routineSlot.count()
      if (existing > 0) return { success: false, error: "Routine already seeded" }
      const slots = [
        { time: "05:00", label: "Fajr & Quran — 1 page, day review, set 3 priorities", duration: 30 },
        { time: "06:00", label: "English shadowing session", duration: 30 },
        { time: "08:00", label: "🔴 PRIMARY CODING BLOCK — protected, no interruption", duration: 90 },
        { time: "Throughout", label: "Client WhatsApp — check 3× daily (morning, midday, evening)", duration: 15 },
        { time: "After classes", label: "Design work for active client projects", duration: 60 },
        { time: "Evening", label: "Malewicz video, AI tools practice, reading", duration: 45 },
        { time: "21:00", label: "Journal entry — what did I complete? tomorrow's 1 priority", duration: 10 },
      ]
      for (let i = 0; i < slots.length; i++) {
        await prisma.routineSlot.create({ data: { ...slots[i], sortOrder: i, duration: slots[i].duration } })
      }
      return { success: true, data: { slotsSeeded: slots.length } }
    },
  },
  {
    name: "seed_business_setup_checklist",
    description: "Seed the business setup checklist items from the spec (BRELA, TRA, bank account, etc.). Run once.",
    parameters: {},
    handler: async () => {
      const existing = await prisma.checklistItem.count({ where: { category: "legal_setup" } })
      if (existing > 0) return { success: false, error: "Checklist already seeded" }
      const items = [
        { category: "legal_setup", title: "Register with BRELA as sole proprietor", description: "Biashara binafsi registration, approx TSh 20,000–35,000" },
        { category: "legal_setup", title: "Register with TRA for TIN", description: "Taxpayer Identification Number, free" },
        { category: "legal_setup", title: "Open a business bank account", description: "NMB, CRDB, or Equity SME account" },
        { category: "legal_setup", title: "Set up M-Pesa Business (Lipa Namba)", description: "Till number for professional receipts" },
        { category: "business_startup", title: "M-Pesa set up for payments", description: "Personal M-Pesa account, screenshot every transaction" },
        { category: "business_startup", title: "Google Sheet income tracker created", description: "Date, client, service, amount, method, status" },
        { category: "business_startup", title: "WhatsApp Business account created", description: "Separate profile, catalog, away message" },
        { category: "business_startup", title: "Professional email address", description: "Format: yourname.design@gmail.com" },
        { category: "business_startup", title: "Behance portfolio set up", description: "3+ spec pieces posted" },
        { category: "business_startup", title: "Wave App invoicing set up", description: "Free invoicing software at waveapps.com" },
        { category: "business_startup", title: "Ideogram AI account created", description: "AI image generation for thumbnails" },
        { category: "business_startup", title: "Leonardo AI account created", description: "AI image generation, 150 tokens/day free" },
      ]
      for (let i = 0; i < items.length; i++) {
        await prisma.checklistItem.create({ data: { ...items[i], sortOrder: i } })
      }
      return { success: true, data: { itemsSeeded: items.length } }
    },
  },
  {
    name: "seed_default_product_transition",
    description: "Initialize the product transition tracker at Stage 1 (Services). Run once.",
    parameters: {},
    handler: async () => {
      const existing = await prisma.productTransition.count()
      if (existing > 0) return { success: false, error: "Product transition already seeded" }
      await prisma.productTransition.create({
        data: {
          stage: "services",
          isCurrent: true,
          metrics: { income: "$0–500/mo", keyMetric: "Paying clients", exitCondition: "5+ retainer clients, coding Phase 2 complete" },
          notes: "Started from LUMARY Business Spec v2 — services phase",
        },
      })
      return { success: true, data: { stage: "services", initialized: true } }
    },
  },
  {
    name: "seed_swahili_templates",
    description: "Seed WhatsApp quick-reply templates from the business spec (Part 7). Run once.",
    parameters: {},
    handler: async () => {
      const existing = await prisma.quickReply.count({ where: { category: "client_communication" } })
      if (existing > 0) return { success: false, error: "Swahili templates already seeded" }
      const templates = [
        { shortcut: "first_contact", title: "📥 When client first contacts", content: "Habari! Asante kwa kuwasiliana. Niambie zaidi kuhusu unachohitaji — ni nini hasa, litatumika wapi, na deadline yako ni lini? Nitakuambia bei na muda wa kukamilisha.", category: "client_communication" },
        { shortcut: "sending_quote", title: "💰 Sending a quote", content: "Hapa kuna quotation yangu: [DESCRIPTION OF WORK]. Bei: TSh [AMOUNT]. Inajumuisha marekebisho 2. Itakuwa tayari ndani ya [TIMEFRAME]. Deposit ya 50% (TSh [HALF AMOUNT]) inahitajika kabla ya kuanza. Unataka tuendelee?", category: "client_communication" },
        { shortcut: "first_version", title: "📎 Sending first version", content: "Hapa kuna version ya kwanza. Niambie mawazo yako na nitafanya marekebisho kama inahitajika. Link ya file ya ubora wa juu: [GOOGLE DRIVE LINK]", category: "client_communication" },
        { shortcut: "request_payment", title: "✅ Requesting final payment", content: "Hii ni version ya mwisho. Tuma salio la TSh [AMOUNT] kwa [MPESA NUMBER] kukamilisha. Asante kwa ushirikiano wako.", category: "client_communication" },
        { shortcut: "request_testimonial", title: "⭐ Requesting a testimonial", content: "Habari [NAME]. Je, watu wanaipendaje design? Ningependa kukuuliza uniandikia ujumbe mfupi kuhusu uzoefu wako nami — ili niweze kuuonyesha wengine. Pia, kama unahitaji kazi zaidi au unafahamu mtu anayehitaji design, nitafurahi kusaidia.", category: "client_communication" },
        { shortcut: "payment_followup", title: "📋 Invoice follow-up (3+ days overdue)", content: "Habari [name]. Nilituma kazi yako wiki iliyopita — bado unasubiri kulipa salio la TSh [X]. Asante.", category: "client_communication" },
        { shortcut: "collab_offer", title: "🤝 Collab DM offer", content: "Habari! Ninafanya design kazi na ninataka kuonyesha kazi yangu. Ninaweza kukutengenezea [specific thing] bure. Kama utapenda, unaweza kunishare kwa wafuasi wako. Hakuna lazima.", category: "client_communication" },
        { shortcut: "scope_change", title: "📐 Scope change request", content: "Hilo ni nje ya scope tuliyokubaliana. Naweza kuongeza kama huduma tofauti kwa TSh [amount].", category: "client_communication" },
        { shortcut: "revision_limit", title: "🔄 Revision limit reached", content: "Tumekamilisha marekebisho 2 kama tulivyokubaliana. Mabadiliko yoyote zaidi ni TSh [amount] kwa kila round.", category: "client_communication" },
        { shortcut: "partial_refund", title: "🔚 Partial refund offer", content: "Nimefanya mabadiliko yote uliyoomba. Kama bado hujaridhika, niko tayari kutoa refund ya sehemu ya TSh [amount] na tutaachana kitaaluma.", category: "client_communication" },
        { shortcut: "deposit_policy", title: "💳 Deposit policy reminder", content: "Policy yangu ni deposit 50% kabla ya kuanza. Hii inatulinda sote wawili.", category: "client_communication" },
      ]
      for (const t of templates) {
        await prisma.quickReply.create({ data: t })
      }
      return { success: true, data: { templatesSeeded: templates.length } }
    },
  },
  {
    name: "seed_full_timetable",
    description: "Seed the complete day-by-day timetable from the printable timetable (7 days, ~130 slots). Run once.",
    parameters: {},
    handler: async () => {
      const existing = await prisma.routineSlot.count({ where: { dayOfWeek: { not: null } } })
      if (existing > 0) return { success: false, error: "Timetable already seeded" }
      const days: { dayOfWeek: number; label: string; slots: { time: string; label: string; duration: number }[] }[] = [
        // Sunday = 0
        { dayOfWeek: 0, label: "Sunday — Deep Work + Week Planning", slots: [
          { time: "05:00", label: "Fajr", duration: 30 },
          { time: "05:30", label: "Arabic — Duolingo + Arabic 101 deep session", duration: 50 },
          { time: "06:20", label: "Exercise 30 min", duration: 30 },
          { time: "07:00", label: "Prep + plan week ahead", duration: 30 },
          { time: "07:30", label: "CODING MARATHON — main dev push", duration: 270 },
          { time: "12:00", label: "Dhuhr + Lunch", duration: 60 },
          { time: "13:00", label: "Power nap 30 min", duration: 30 },
          { time: "13:30", label: "Reading (30 min) + Arabic listening", duration: 60 },
          { time: "14:30", label: "Figma Deep Work (1 hr)", duration: 60 },
          { time: "15:30", label: "Review week ahead / prep Monday", duration: 60 },
          { time: "16:30", label: "Asr", duration: 30 },
          { time: "17:00", label: "Social media 45 min", duration: 60 },
          { time: "18:00", label: "Maghrib", duration: 15 },
          { time: "19:45", label: "Isha", duration: 15 },
          { time: "20:00", label: "Night coding (1.5 hrs)", duration: 90 },
          { time: "21:30", label: "Journal", duration: 30 },
          { time: "22:00", label: "Sleep — Phone away, lights out", duration: 420 },
        ]},
        // Monday = 1
        { dayOfWeek: 1, label: "Monday — Heavy Day (4 classes)", slots: [
          { time: "05:00", label: "Fajr — Pray, read Quran 1 page", duration: 30 },
          { time: "05:30", label: "Review day — Open LUMARY, set 3 priorities", duration: 30 },
          { time: "06:00", label: "Arabic — Duolingo lesson + write 3 new words", duration: 30 },
          { time: "06:30", label: "Breakfast", duration: 30 },
          { time: "07:00", label: "Commute — Audio: ArabicPod101 or Quran revision", duration: 60 },
          { time: "08:00", label: "Soil Mechanics — CET 04202 (Room A1)", duration: 120 },
          { time: "10:00", label: "Building Maintenance — CET 04201 (Room B4)", duration: 120 },
          { time: "12:00", label: "Maths / Trig — CET 04203 (Room A1)", duration: 60 },
          { time: "13:00", label: "Dhuhr + Lunch", duration: 60 },
          { time: "14:00", label: "Arch Drawing — CET 04204 (Drawing Studio)", duration: 120 },
          { time: "16:30", label: "Asr", duration: 15 },
          { time: "16:45", label: "PRIMARY BLOCK — Coding (LUMARY roadmap Phase 1+)", duration: 105 },
          { time: "18:30", label: "Maghrib — Stop all screens", duration: 20 },
          { time: "18:50", label: "AI Tools / Reading — 10 min AI + 20 min book", duration: 40 },
          { time: "19:30", label: "Isha — Pray, Quran", duration: 30 },
          { time: "20:00", label: "Social 45 min — Time-limited / Mary call", duration: 60 },
          { time: "21:00", label: "Journal + Plan tomorrow", duration: 60 },
          { time: "22:00", label: "Sleep — Phone away, lights out", duration: 420 },
        ]},
        // Tuesday = 2
        { dayOfWeek: 2, label: "Tuesday — Medium Day (2 classes, free PM)", slots: [
          { time: "05:00", label: "Fajr — Pray, Quran 1 page", duration: 60 },
          { time: "06:00", label: "Arabic — Duolingo + Arabic 101 video", duration: 60 },
          { time: "07:00", label: "Commute — Audio revision", duration: 60 },
          { time: "08:00", label: "Prep — Revise yesterday's code notes", duration: 120 },
          { time: "10:00", label: "Building Maintenance — CET 04201 (Room B4)", duration: 120 },
          { time: "12:00", label: "Dhuhr + Lunch", duration: 60 },
          { time: "13:00", label: "PRIMARY BLOCK — Coding, 2 Pomodoros", duration: 60 },
          { time: "14:00", label: "Arch Drawing — CET 04204 (Drawing Studio)", duration: 120 },
          { time: "16:30", label: "Asr", duration: 15 },
          { time: "16:45", label: "Figma — 30 min Advanced session", duration: 30 },
          { time: "17:15", label: "Video Editing — DaVinci Resolve 30 min", duration: 75 },
          { time: "18:30", label: "Maghrib + Dinner", duration: 60 },
          { time: "19:30", label: "Isha — Pray, Quran", duration: 30 },
          { time: "20:00", label: "Arabic / Reading — Maha lesson + 20 min book", duration: 60 },
          { time: "21:00", label: "Journal", duration: 60 },
          { time: "22:00", label: "Sleep", duration: 420 },
        ]},
        // Wednesday = 3
        { dayOfWeek: 3, label: "Wednesday — Heavy Day (3 classes)", slots: [
          { time: "05:00", label: "Fajr — Pray, Quran", duration: 60 },
          { time: "06:00", label: "Arabic — Duolingo lesson + alphabet review", duration: 60 },
          { time: "07:00", label: "Commute — Audio", duration: 60 },
          { time: "08:00", label: "Arc Welding — CET 04206 (Workshop)", duration: 120 },
          { time: "10:00", label: "Spreadsheets & DB — CET 04207 (Computer Lab)", duration: 120 },
          { time: "12:00", label: "Dhuhr + Lunch", duration: 60 },
          { time: "13:00", label: "PRIMARY BLOCK — Coding, roadmap task work", duration: 60 },
          { time: "14:00", label: "Masonry & Plumbing — CET 04205 (Workshop/Field)", duration: 120 },
          { time: "16:30", label: "Asr", duration: 30 },
          { time: "17:00", label: "Arabic + AI Tools — Arabic 101 video + 10 min AI", duration: 90 },
          { time: "18:30", label: "Maghrib", duration: 60 },
          { time: "19:30", label: "Isha + Reading — Pray, 20 min reading", duration: 90 },
          { time: "21:00", label: "Journal", duration: 60 },
          { time: "22:00", label: "Sleep", duration: 420 },
        ]},
        // Thursday = 4
        { dayOfWeek: 4, label: "Thursday — Heavy Day (4 classes spread)", slots: [
          { time: "05:00", label: "Fajr — Pray, Quran", duration: 60 },
          { time: "06:00", label: "Arabic — Duolingo + Maha speaking practice", duration: 60 },
          { time: "07:00", label: "Commute — Audio revision", duration: 60 },
          { time: "08:00", label: "Maths — CET 04203 (Room A1)", duration: 120 },
          { time: "10:00", label: "Masonry & Plumbing — CET 04205 (Workshop)", duration: 120 },
          { time: "12:00", label: "Spreadsheets & DB — CET 04207 (Computer Lab)", duration: 60 },
          { time: "13:00", label: "Dhuhr + Lunch", duration: 60 },
          { time: "14:00", label: "Arc Welding — CET 04206 (Workshop)", duration: 120 },
          { time: "16:30", label: "Asr", duration: 15 },
          { time: "16:45", label: "PRIMARY BLOCK — Coding, Figma 30min after", duration: 105 },
          { time: "18:30", label: "Maghrib", duration: 60 },
          { time: "19:30", label: "Isha + Arabic — Pray, reading + Arabic practice", duration: 90 },
          { time: "21:00", label: "Weekly review — What did I complete this week?", duration: 60 },
          { time: "22:00", label: "Sleep", duration: 420 },
        ]},
        // Friday = 5
        { dayOfWeek: 5, label: "Friday — 3 classes + Jumuah", slots: [
          { time: "05:00", label: "Fajr — Pray, Quran longer recitation", duration: 60 },
          { time: "06:00", label: "Arabic — Duolingo + Quran vocab review", duration: 60 },
          { time: "07:00", label: "Commute — Surah Al-Kahf recitation + reflection", duration: 60 },
          { time: "08:00", label: "Building Maintenance — CET 04201 (Room B2)", duration: 120 },
          { time: "10:00", label: "Soil Mechanics — CET 04202 (Room A3)", duration: 120 },
          { time: "12:00", label: "Jumuah Prayer", duration: 90 },
          { time: "13:30", label: "Masonry & Plumbing — CET 04205 (Workshop)", duration: 150 },
          { time: "16:30", label: "Asr", duration: 15 },
          { time: "16:45", label: "Social 45 min — TIME LIMITED", duration: 45 },
          { time: "17:30", label: "Video Editing — Content work 30 min", duration: 60 },
          { time: "18:30", label: "Maghrib", duration: 60 },
          { time: "19:30", label: "Isha + Reading — Pray, 20 min book", duration: 60 },
          { time: "20:30", label: "Mary call — Protected time", duration: 90 },
          { time: "22:00", label: "Sleep", duration: 420 },
        ]},
        // Saturday = 6
        { dayOfWeek: 6, label: "Saturday — Coding Marathon Day", slots: [
          { time: "05:00", label: "Fajr", duration: 30 },
          { time: "05:30", label: "Arabic — Duolingo + Arabic 101 deep session (50 min)", duration: 50 },
          { time: "06:20", label: "Exercise 30 min", duration: 30 },
          { time: "07:00", label: "Prep + plan week ahead", duration: 30 },
          { time: "07:30", label: "CODING MARATHON (6+ pomodoros, main dev push)", duration: 270 },
          { time: "12:00", label: "Dhuhr + Lunch", duration: 60 },
          { time: "13:00", label: "Power nap 30 min", duration: 30 },
          { time: "13:30", label: "Reading (30 min)", duration: 60 },
          { time: "14:00", label: "Figma Deep Work (1 hr)", duration: 60 },
          { time: "15:00", label: "College revision (1.5 hrs)", duration: 90 },
          { time: "16:30", label: "Asr", duration: 30 },
          { time: "17:00", label: "Social media 45 min", duration: 60 },
          { time: "18:00", label: "Maghrib", duration: 15 },
          { time: "19:45", label: "Isha", duration: 15 },
          { time: "20:00", label: "Night coding (1.5 hrs)", duration: 90 },
          { time: "21:30", label: "Journal", duration: 30 },
          { time: "22:00", label: "Sleep", duration: 420 },
        ]},
      ]
      let total = 0
      for (const day of days) {
        for (let i = 0; i < day.slots.length; i++) {
          await prisma.routineSlot.create({
            data: {
              time: day.slots[i].time,
              label: day.slots[i].label,
              duration: day.slots[i].duration,
              dayOfWeek: day.dayOfWeek,
              sortOrder: i,
            },
          })
          total++
        }
      }
      return { success: true, data: { slotsSeeded: total, daysSeeded: days.length } }
    },
  },
  {
    name: "get_today_full_timetable",
    description: "Get today's complete timetable with all scheduled slots from the printable timetable.",
    parameters: {},
    handler: async () => {
      const dayOfWeek = new Date().getDay()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const slots = await prisma.routineSlot.findMany({
        where: { dayOfWeek, isActive: true },
        orderBy: { sortOrder: "asc" },
      })
      const logs = await prisma.routineLog.findMany({
        where: { date: { gte: today } },
        select: { slotId: true, completed: true, durationActual: true },
      })
      const logMap = new Map(logs.map((l) => [l.slotId, l]))
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      return {
        success: true,
        data: {
          day: dayNames[dayOfWeek],
          date: today.toISOString().slice(0, 10),
          slots: slots.map((s) => ({
            id: s.id,
            time: s.time,
            label: s.label,
            duration: s.duration,
            done: logMap.get(s.id)?.completed ?? false,
            actualMinutes: logMap.get(s.id)?.durationActual ?? null,
          })),
        },
      }
    },
  },
  {
    name: "seed_reading_list",
    description: "Seed the 5-book reading queue from the printable timetable (Atomic Habits → Alchemist). Run once.",
    parameters: {},
    handler: async () => {
      const existing = await prisma.book.count()
      if (existing > 0) return { success: false, error: "Books already seeded" }
      const books = [
        { title: "Atomic Habits", author: "James Clear", pages: 320, status: "reading", notes: "Build the discipline system behind everything. 20 min/day, 32 days." },
        { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", pages: 381, status: "unread", notes: "Sharpen your mindset. Think long-term. 20 min/day, 45 days." },
        { title: "How to Win Friends and Influence People", author: "Dale Carnegie", pages: 288, status: "unread", notes: "People skills = wealth skills. 20 min/day, 30 days." },
        { title: "The Lean Startup", author: "Eric Ries", pages: 336, status: "unread", notes: "Build products people actually want. 20 min/day, 35 days." },
        { title: "The Alchemist", author: "Paulo Coelho", pages: 197, status: "unread", notes: "Inspiration when you need it. 20 min/day, 20 days." },
      ]
      for (const b of books) {
        await prisma.book.create({ data: b })
      }
      return { success: true, data: { booksSeeded: books.length } }
    },
  },
  {
    name: "log_reading_session",
    description: "Log a daily reading session (20 min default, marks progress in current book).",
    parameters: {
      bookId: { type: "string", description: "Book ID (omit to log in the first 'reading' book)", required: false },
      pagesRead: { type: "number", description: "Pages read (default 10)" },
      duration: { type: "number", description: "Minutes read (default 20)" },
    },
    handler: async (args) => {
      let bookId = args.bookId as string | undefined
      if (!bookId) {
        const current = await prisma.book.findFirst({ where: { status: "reading" }, orderBy: { createdAt: "asc" } })
        if (!current) return { success: false, error: "No book with status 'reading' found. Seed the reading list first." }
        bookId = current.id
      }
      const session = await prisma.readingSession.create({
        data: {
          bookId,
          pagesRead: (args.pagesRead as number) ?? 10,
          date: new Date(),
        },
      })
      return { success: true, data: session }
    },
  },
  {
    name: "advance_to_next_book",
    description: "Mark current book as finished and start the next unread book in the queue.",
    parameters: {
      bookId: { type: "string", description: "ID of book to mark finished (omit = auto-detect current reading book)" },
    },
    handler: async (args) => {
      let bookId = args.bookId as string | undefined
      if (!bookId) {
        const current = await prisma.book.findFirst({ where: { status: "reading" }, orderBy: { createdAt: "asc" } })
        if (!current) return { success: false, error: "No book currently being read." }
        bookId = current.id
      }
      await prisma.book.update({
        where: { id: bookId },
        data: { status: "finished", finishedAt: new Date() },
      })
      const next = await prisma.book.findFirst({
        where: { status: "unread" },
        orderBy: { createdAt: "asc" },
      })
      if (next) {
        await prisma.book.update({
          where: { id: next.id },
          data: { status: "reading", startedAt: new Date() },
        })
        return { success: true, data: { finished: bookId, started: next.id, nextBook: next.title } }
      }
      return { success: true, data: { finished: bookId, started: null, message: "All books finished!" } }
    },
  },
]
