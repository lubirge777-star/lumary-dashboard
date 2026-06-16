"use client"

import { useEffect } from "react"
import { PipelinePage } from "@/components/pipeline/pipeline-page"

export default function ProjectsRoute() {
  useEffect(() => { document.title = "Pipeline — LUMARY Studio" }, [])
  return <PipelinePage />
}
