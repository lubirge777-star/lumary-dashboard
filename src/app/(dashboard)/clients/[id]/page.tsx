"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { ClientDetailPage } from "@/components/clients/client-detail-page"

export default function ClientRoute() {
  useEffect(() => { document.title = "Client — LUMARY Studio" }, [])
  const params = useParams()
  return <ClientDetailPage clientId={params.id as string} />
}
