// Monitoring wrapper with optional Sentry support.
// If Sentry is not configured, it will noop to console.

type Level = "info" | "warning" | "error"

function getSentry(): any | null {
  // Expect Sentry to be registered globally when @sentry/nextjs is set up.
  // Avoid static imports to prevent build errors when dependency is missing.
  // @ts-ignore
  return (globalThis as any).Sentry || null
}

export const monitoring = {
  captureException: (error: unknown, context?: Record<string, unknown>) => {
    const sentry = getSentry()
    if (sentry?.captureException) {
      sentry.captureException(error, { extra: context })
    } else {
      console.error("[monitoring] exception", error, context)
    }
  },
  captureMessage: (message: string, level: Level = "info") => {
    const sentry = getSentry()
    if (sentry?.captureMessage) {
      sentry.captureMessage(message, level)
    } else {
      const logFn = level === "error" ? console.error : level === "warning" ? console.warn : console.log
      logFn(`[monitoring] ${level}:`, message)
    }
  },
  setUser: (user: { id?: string | number; email?: string; role?: string }) => {
    const sentry = getSentry()
    if (sentry?.setUser) {
      sentry.setUser({
        id: user.id?.toString(),
        email: user.email,
        role: user.role,
      })
    } else {
      console.log("[monitoring] setUser", user)
    }
  },
  trackPageView: (page: string) => {
    const sentry = getSentry()
    if (sentry?.addBreadcrumb) {
      sentry.addBreadcrumb({ category: "navigation", message: `page view: ${page}`, level: "info" })
    }
    console.log("[monitoring] page view", page)
  },
}

// Optional init helper (call from _app or layout when Sentry DSN is ready)
export function initMonitoring() {
  // If @sentry/nextjs is installed and configured via env, it will auto-init.
  // This function is a placeholder to keep API consistent.
  return getSentry()
}
