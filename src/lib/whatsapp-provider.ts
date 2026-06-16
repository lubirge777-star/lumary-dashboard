import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import type { WASocket } from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import path from "path"
import pino from "pino"
import QRCode from "qrcode"
import { prisma } from "./prisma"

const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug", transport: { target: "pino-pretty" } })

let socket: WASocket | null = null
let qrBase64: string | null = null
let connectionState: "close" | "connecting" | "open" = "close"

function getGlobal(key: string, defaultValue?: any): any {
  const g = global as any
  if (g[key] === undefined && defaultValue !== undefined) g[key] = defaultValue
  return g[key]
}

function setGlobal(key: string, value: any): void {
  ;(global as any)[key] = value
}

// Track QR expiry for auto-refresh
let qrRefreshTimer: ReturnType<typeof setTimeout> | null = null
const QR_EXPIRY_MS = 55_000 // Baileys QR expires ~60s — refresh before that

function deleteSessionFiles() {
  const fs = require("fs")
  const dir = path.join(process.cwd(), ".baileys-auth")
  try {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      if (file !== ".gitkeep") {
        fs.rmSync(path.join(dir, file), { recursive: true, force: true })
      }
    }
  } catch {}
}

export async function getQR(): Promise<string | null> {
  return getGlobal("whatsapp_qr", null)
}

export function getConnectionState(): { state: string; connected: boolean } {
  const state = getGlobal("whatsapp_state", "close")
  return { state, connected: state === "open" }
}

export async function startSocket(): Promise<void> {
  const existing = getGlobal("whatsapp_socket")
  if (existing) return

  const { version } = await fetchLatestBaileysVersion()
  logger.info(`Baileys version: ${version.join(".")}`)

  const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), ".baileys-auth"))

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    emitOwnEvents: false,
  })

  setGlobal("whatsapp_socket", sock)

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      if (qrRefreshTimer) clearTimeout(qrRefreshTimer)
      const qrData = await QRCode.toDataURL(qr, { width: 400, margin: 2 })
      setGlobal("whatsapp_qr", qrData)
      setGlobal("whatsapp_state", "connecting")
      logger.info("QR code generated")

      // Schedule auto-refresh — if QR expires without scan, force new one
      qrRefreshTimer = setTimeout(() => {
        const state = getGlobal("whatsapp_state")
        if (state !== "open") {
          logger.info("QR expired, regenerating...")
          setGlobal("whatsapp_qr", null)
          setGlobal("whatsapp_socket", null)
          startSocket()
        }
      }, QR_EXPIRY_MS)
    }

    if (connection) {
      setGlobal("whatsapp_state", connection)

      if (connection === "close") {
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode
        setGlobal("whatsapp_socket", null)

        if (reason === DisconnectReason.loggedOut) {
          logger.warn("Logged out from WhatsApp, deleting session")
          setGlobal("whatsapp_qr", null)
          deleteSessionFiles()
        } else {
          logger.info(`Disconnected (reason: ${reason}), reconnecting in 3s...`)
          setTimeout(startSocket, 3000)
        }
      } else if (connection === "open") {
        logger.info("WhatsApp connected!")
        if (qrRefreshTimer) clearTimeout(qrRefreshTimer)
      }
    }
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.key.fromMe && msg.message?.conversation) {
        const text = msg.message.conversation
        const from = msg.key.remoteJid?.replace(/@s\.whatsapp\.net$/, "") || ""

        try {
          await prisma.message.create({
            data: {
              channel: "WHATSAPP",
              direction: "INBOUND",
              content: text,
              clientId: "",
              createdAt: new Date(msg.messageTimestamp ? Number(msg.messageTimestamp) * 1000 : Date.now()),
            },
          })
        } catch {}
      }
    }
  })
}

export async function disconnectSocket(): Promise<void> {
  const sock = getGlobal("whatsapp_socket") as WASocket | null
  if (sock) {
    sock.end(new Error("Manual disconnect"))
    setGlobal("whatsapp_socket", null)
    setGlobal("whatsapp_qr", null)
    setGlobal("whatsapp_state", "close")
  }
}

export async function sendMessage(to: string, text: string): Promise<boolean> {
  const sock = getGlobal("whatsapp_socket") as WASocket | null
  if (!sock) return false
  try {
    const jid = to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`
    await sock.sendMessage(jid, { text })
    return true
  } catch (e) {
    logger.error(e, "Failed to send message")
    return false
  }
}
