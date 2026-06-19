import { NextRequest } from "next/server"
import { transcribeAudio } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { audio, mimeType } = await req.json()
    if (!audio) {
      return Response.json({ text: "" }, { status: 400 })
    }

    const text = await transcribeAudio(audio, mimeType || "audio/webm", "Transcribe this audio recording exactly as spoken. Return only the transcribed text, no extra words.")
    return Response.json({ text: text || "" })
  } catch {
    return Response.json({ text: "" }, { status: 500 })
  }
}
