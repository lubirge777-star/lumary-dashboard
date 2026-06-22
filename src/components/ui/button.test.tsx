import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Button } from "./button"

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("applies variant classes", () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByText("Ghost")
    expect(btn.className).toContain("bg-transparent")
  })

  it("shows loading state", () => {
    render(<Button disabled>Loading...</Button>)
    const btn = screen.getByText("Loading...")
    expect(btn).toBeDisabled()
  })
})
