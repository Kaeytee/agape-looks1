"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SiteHeader } from "@/components/site-header"
import { StatefulButton } from "@/components/ui/stateful-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Cover } from "@/components/ui/cover"
import { authService } from "@/lib/services/auth.service"
import { useAuth } from "@/lib/contexts/auth-context"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()

  // Redirect if already logged in
  React.useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/shop")
    }
  }, [router])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Real authentication with backend
      const response = await authService.login({ email, password })

      // Store auth token
      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken)
        localStorage.setItem("token", response.accessToken)
      }

      // Update context
      login(response.user)

      setIsLoading(false)

      // Redirect to shop
      router.push("/shop")
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed. Please check your credentials.")
      setIsLoading(false)
      throw err // Re-throw for StatefulButton if needed
    }
  }

  const handleButtonClick = async () => {
    return handleSubmit()
  }

  const fabricImages = [
    "/brocade-material-red-purple.jpeg",
    "/royal-collection-lace.jpg",
    "/beaded-lace-style-purple.jpeg",
    "/brocade-style-red.jpeg",
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 grid lg:grid-cols-2">
        {/* Left Side - Fabric Images */}
        <div className="hidden lg:block relative overflow-hidden bg-primary/10">
          <div className="absolute inset-0 grid grid-cols-2 gap-2 p-4">
            {fabricImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-xl overflow-hidden group"
              >
                <Image
                  src={image}
                  alt={`Fabric collection ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/20" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center bg-background px-4 py-12">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-5xl font-bold mb-2">
                <span className="text-foreground">Welcome</span> <Cover>Back</Cover>
              </h1>
              <p className="text-muted-foreground text-lg">Sign in to your Agape looks account</p>
            </motion.div>

            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>

                <StatefulButton type="button" className="w-full h-10" disabled={isLoading} onClick={handleButtonClick}>
                  Sign In
                </StatefulButton>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  Create account
                </Link>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
