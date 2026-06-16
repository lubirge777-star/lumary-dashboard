"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-lg font-semibold text-[#f5f5f7] mb-2">Something went wrong</h2>
            <p className="text-sm text-[#6b6b7b] mb-6">{this.state.error?.message || "An unexpected error occurred"}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-[#0a0a0f] rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#d4a853]/20 active:scale-[0.98] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
