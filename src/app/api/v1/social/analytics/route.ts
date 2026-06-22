import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth) return auth

  try {
    const since = new Date()
    since.setDate(since.getDate() - 7)
    const posts = await prisma.socialMediaPost.findMany({
      where: { postedAt: { gte: since } },
    })
    const byPillar: Record<string, number> = {}
    const byPlatform: Record<string, number> = {}
    let totalViews = 0, totalLikes = 0, totalComments = 0, totalDMs = 0
    for (const p of posts) {
      byPillar[p.pillar] = (byPillar[p.pillar] || 0) + 1
      byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1
      totalViews += p.views; totalLikes += p.likes; totalComments += p.comments; totalDMs += p.dmsReceived
    }
    return NextResponse.json({
      data: {
        totalPosts: posts.length, totalViews, totalLikes, totalComments, totalDMs, byPillar, byPlatform,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
