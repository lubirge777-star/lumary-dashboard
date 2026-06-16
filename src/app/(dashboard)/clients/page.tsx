"use client"

import { useEffect } from "react"
import { ClientsPage } from "@/components/clients/clients-page"

export default function ClientsRoute() {
  useEffect(() => { document.title = "Clients — LUMARY Studio" }, [])
  return <ClientsPage />
}
