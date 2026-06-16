"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phone, ArrowRight } from "lucide-react"

export default function PortalLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!phone.trim()) { setError("Please enter your phone number"); return }
    setLoading(true)

    try {
      const res = await fetch("/api/v1/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber: phone.trim() }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Client not found")
        setLoading(false)
        return
      }

      sessionStorage.setItem("clientId", data.client.id)
      router.push(`/portal/${data.client.id}`)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(157,67,25,1) 1px, transparent 1px), linear-gradient(90deg, rgba(157,67,25,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative w-full max-w-sm mx-4">
        <div className="rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/5">
          <div className="text-center mb-8">
            <div className="relative inline-flex mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                L
              </div>
            </div>
            <h1 className="text-headline-lg text-on-surface font-bold animate-fadeInUp">Lumary</h1>
            <p className="text-sm text-on-surface-variant/70 mt-1.5 animate-fadeInUp" style={{ animationDelay: "100ms" }}>Client Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 animate-fadeInUp" style={{ animationDelay: "150ms" }}>
              <label className="text-sm font-medium text-on-surface-variant">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/80" />
                <input
                  type="tel"
                  placeholder="+255 7XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-error text-center animate-fadeIn">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 animate-fadeInUp"
              style={{ animationDelay: "200ms" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Access Portal
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-on-surface-variant/70 mt-6 animate-fadeInUp" style={{ animationDelay: "250ms" }}>
            LUMARY Studio &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
