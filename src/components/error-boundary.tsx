"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Something went wrong</h2>
          <p className="text-sm text-on-surface-variant/70 mb-6 max-w-md">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            variant="primary"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            <RefreshCcw className="w-4 h-4 mr-1.5" />
            Try Again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
