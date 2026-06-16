import { describe, it, expect } from "vitest"
import { cn, formatTSh } from "./utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("handles undefined values", () => {
    expect(cn("a", undefined, "b")).toBe("a b")
  })
})

describe("formatTSh", () => {
  it("formats zero", () => {
    expect(formatTSh(0)).toContain("0")
  })

  it("formats thousands", () => {
    const result = formatTSh(1500000)
    expect(result).toContain("1,500,000")
    expect(result).toContain("TSh")
  })

  it("formats small numbers", () => {
    const result = formatTSh(500)
    expect(result).toContain("500")
  })
})
