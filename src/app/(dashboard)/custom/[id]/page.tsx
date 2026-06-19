import { prisma } from "@/lib/prisma"
import PageRenderer from "@/components/custom-page/renderer"
import { notFound } from "next/navigation"

export default async function CustomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await prisma.customPage.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  })

  if (!page) notFound()

  const config = page.config as {
    title: string
    layout: "grid" | "list"
    blocks: any[]
  }

  return <PageRenderer config={config} />
}
