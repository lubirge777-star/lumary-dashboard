import { redirect } from "next/navigation"

export default function WedgePage() {
  redirect("/ideas?tab=problems")
}
