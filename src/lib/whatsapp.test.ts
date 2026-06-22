import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetch = vi.hoisted(() => vi.fn())

vi.mock("next/navigation", () => ({}))
vi.stubGlobal("fetch", mockFetch)
vi.stubGlobal("AbortSignal", { timeout: () => ({}) })

beforeEach(() => {
  mockFetch.mockReset()
})

describe("checkWhatsAppConnection", () => {
  it("returns connected=false when bridge is offline", async () => {
    mockFetch.mockRejectedValue(new Error("fetch failed"))
    const { checkWhatsAppConnection } = await import("./whatsapp")
    const result = await checkWhatsAppConnection()
    expect(result).toEqual({ connected: false, state: "offline" })
  })

  it("returns status when bridge responds", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ connected: true, state: "open" }),
    })
    const { checkWhatsAppConnection } = await import("./whatsapp")
    const result = await checkWhatsAppConnection()
    expect(result.connected).toBe(true)
    expect(result.state).toBe("open")
  })
})

describe("sendWhatsApp", () => {
  it("returns success when bridge responds ok", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
    const { sendWhatsApp } = await import("./whatsapp")
    const result = await sendWhatsApp("255700000000", "Test message")
    expect(result).toEqual({ success: true })
  })

  it("returns error when bridge is offline", async () => {
    mockFetch.mockRejectedValue(new Error("fetch failed"))
    const { sendWhatsApp } = await import("./whatsapp")
    const result = await sendWhatsApp("255700000000", "Test")
    expect(result.success).toBe(false)
    expect(result.error).toContain("Bridge offline")
  })

  it("returns error when bridge returns error", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: "Invalid number" }),
    })
    const { sendWhatsApp } = await import("./whatsapp")
    const result = await sendWhatsApp("invalid", "Test")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Invalid number")
  })
})
