"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Eye, EyeOff, Sparkles } from "lucide-react"
import { Logo } from "@/components/brand/logo"

export default function LoginPage() {
  const [email, setEmail] = useState("lubirge@lumary.com")
  const [password, setPassword] = useState("lumary2026")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
        return
      }

      if (result?.ok) {
        window.location.href = "/"
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(157,67,25,1) 1px, transparent 1px), linear-gradient(90deg, rgba(157,67,25,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative w-full max-w-sm mx-4">
        <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-surface-container-high/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/5">
          <div className="text-center mb-8">
            <div className="inline-flex mb-4">
              <Logo size="lg" link={false} showTagline />
            </div>
            <p className="text-sm text-on-surface-variant/70 mt-3 animate-fadeInUp" style={{ animationDelay: "100ms" }}>Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 animate-fadeInUp" style={{ animationDelay: "150ms" }}>
              <label className="text-sm font-medium text-on-surface-variant">Email</label>
              <input
                type="email"
                placeholder="lubirge@lumary.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
              />
            </div>

            <div className="space-y-1.5 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
              <label className="text-sm font-medium text-on-surface-variant">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-xl px-4 py-2.5 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 hover:text-on-surface transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-error text-center animate-fadeIn">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 animate-fadeInUp"
              style={{ animationDelay: "250ms" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Ingia
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-on-surface-variant/70 mt-6 animate-fadeInUp" style={{ animationDelay: "300ms" }}>
            Lumary Studio &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
