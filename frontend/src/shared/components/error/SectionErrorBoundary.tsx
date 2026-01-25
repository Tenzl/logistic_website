"use client"

import React from "react"
import { monitoring } from "../../utils/monitoring"
import { Button } from "@/shared/components/ui/button"
import { SectionLoadingSkeleton } from "@/shared/components/loading/SectionLoadingSkeleton"

interface SectionErrorBoundaryProps {
  sectionId: string
  children: React.ReactNode
}

interface SectionErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    monitoring.captureException?.(error, {
      sectionId: this.props.sectionId,
      componentStack: errorInfo.componentStack,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] rounded-md border bg-muted/40 p-6 text-center">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={this.handleReset}>
              Try again
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function SectionSuspenseFallback() {
  return <SectionLoadingSkeleton />
}
