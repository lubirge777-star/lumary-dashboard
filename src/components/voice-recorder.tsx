"use client"

import { useState, useRef, useCallback } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import clsx from "clsx"

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  disabled?: boolean
}

export default function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setProcessing(true)

        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1]
          try {
            const res = await fetch("/api/v1/agent/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio: base64, mimeType: "audio/webm" }),
            })
            const data = await res.json()
            if (data.text) onTranscription(data.text)
          } catch {
            // fallback silent
          } finally {
            setProcessing(false)
          }
        }
        reader.readAsDataURL(blob)
      }

      recorder.start()
      setRecording(true)
    } catch {
      // mic access denied
    }
  }, [onTranscription])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }, [])

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled || processing}
      className={clsx(
        "p-2.5 rounded-xl transition-all shrink-0",
        recording
          ? "bg-error text-white animate-pulse shadow-lg shadow-error/30"
          : "hover:bg-surface-variant/30 text-on-surface-variant/50 hover:text-primary",
        (disabled || processing) && "opacity-30 cursor-not-allowed",
      )}
      title={recording ? "Stop recording" : "Start voice input"}
    >
      {processing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : recording ? (
        <Square className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  )
}
