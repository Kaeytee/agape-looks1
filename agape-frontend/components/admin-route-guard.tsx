"use client"

/**
 * Admin Route Guard Component
 * Protects admin routes by checking authentication and admin role
 * Redirects unauthorized users to login or home page
 * @component
 */

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"

interface AdminRouteGuardProps {
  children: React.ReactNode
}

/**
 * Admin Route Guard
 * Wraps admin pages to ensure only authenticated admins can access
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    // Only check when auth loading is complete
    if (!isLoading) {
      if (!user) {
        // No user, redirect to login
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (user.role !== "admin") {
        // User exists but not admin, redirect home
        router.push("/")
      }
    }
  }, [user, isLoading, router, pathname])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // If not authorized (and not loading), don't render children
  // The useEffect will handle the redirect
  if (!user || user.role !== "admin") {
    return null
  }

  // User is authorized, render the admin page
  return <>{children}</>
}
