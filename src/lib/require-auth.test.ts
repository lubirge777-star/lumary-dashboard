import { describe, it, expect, vi, beforeEach } from "vitest"

const mockAuth = vi.hoisted(() => vi.fn())

vi.mock("./auth", () => ({
  auth: mockAuth,
}))

import { requireAuth } from "./require-auth"

beforeEach(() => {
  mockAuth.mockClear()
})

describe("requireAuth", () => {
  it("returns null when session exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", email: "test@test.com" } })
    const result = await requireAuth()
    expect(result).toBeNull()
  })

  it("returns 401 response when no session", async () => {
    mockAuth.mockResolvedValue(null)
    const result = await requireAuth()
    expect(result).not.toBeNull()
    expect(result).toBeInstanceOf(Response)
    const body = await (result as Response).json()
    expect(body).toEqual({ error: "Unauthorized" })
    expect((result as Response).status).toBe(401)
  })

  it("returns 401 when session has no user", async () => {
    mockAuth.mockResolvedValue({})
    const result = await requireAuth()
    expect((result as Response).status).toBe(401)
  })

  it("awaits auth() call", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1" } })
    await requireAuth()
    expect(mockAuth).toHaveBeenCalledTimes(1)
  })
})
