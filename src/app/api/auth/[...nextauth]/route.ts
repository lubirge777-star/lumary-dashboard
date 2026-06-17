import { handlers } from "@/lib/auth"

export async function GET(request: Request) {
  return handlers.GET(request)
}

export async function POST(request: Request) {
  return handlers.POST(request)
}
