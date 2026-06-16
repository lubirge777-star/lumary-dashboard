"use client"

import { useEffect } from "react"
import { FinancePage } from "@/components/finance/finance-page"

export default function FinanceRoute() {
  useEffect(() => { document.title = "Finance — LUMARY Studio" }, [])
  return <FinancePage />
}
