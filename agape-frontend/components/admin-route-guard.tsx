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
  const [isChecking, setIsChecking] = React.useState(true)
  const [isAuthorized, setIsAuthorized] = React.useState(false)

  React.useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return

    const checkAdminAccess = () => {
      // If no user, redirect to login
      if (!user) {
        console.warn("No user found. Redirecting to login...")
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      // Check if user has admin role
      if (user.role !== "admin") {
        console.warn("User is not an admin. Redirecting to home...")
        router.push("/")
        return
      }

      // User is authenticated and is an admin
      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAdminAccess()
  }, [user, isLoading, router, pathname])

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // If not authorized, don't render anything (redirect is in progress)
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  // User is authorized, render the admin page
  return <>{children}</>
}
