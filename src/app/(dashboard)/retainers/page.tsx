"use client"

import { useEffect } from "react"
import { RetainersPage } from "@/components/retainers/retainers-page"

export default function RetainersRoute() {
  useEffect(() => { document.title = "Retainers — LUMARY Studio" }, [])
  return <RetainersPage />
}
