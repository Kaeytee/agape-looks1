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

interface AdminRouteGuardProps {
  children: React.ReactNode
}

/**
 * Admin Route Guard
 * Wraps admin pages to ensure only authenticated admins can access
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = React.useState(true)
  const [isAuthorized, setIsAuthorized] = React.useState(false)

  React.useEffect(() => {
    const checkAdminAccess = () => {
      // Get token and user from localStorage
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")

      // If no token, redirect to login with return URL
      if (!token) {
        console.warn("No authentication token found. Redirecting to login...")
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      // If no user data, redirect to login
      if (!userStr) {
        console.warn("No user data found. Redirecting to login...")
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      try {
        // Parse user data
        const user = JSON.parse(userStr)

        // Check if user has admin role
        if (user.role !== "admin") {
          console.warn("User is not an admin. Redirecting to home...")
          router.push("/")
          return
        }

        // User is authenticated and is an admin
        setIsAuthorized(true)
      } catch (error) {
        console.error("Error parsing user data:", error)
        // If user data is corrupted, clear it and redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
        return
      } finally {
        setIsChecking(false)
      }
    }

    checkAdminAccess()
  }, [router, pathname])

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
