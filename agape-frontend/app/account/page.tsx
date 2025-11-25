"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Package,
  Heart,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Loader2
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/contexts/auth-context"
import { getCurrentUser } from "@/lib/api/users"
import { type User as UserType } from "@/lib/types"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  const userData: UserType = user || {
    id: '',
    name: 'Guest',
    email: '',
    role: 'customer',
    verified: false,
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orderCount: 0,
    wishlistCount: 0,
  };

  const accountSections = [
    {
      title: "Orders",
      description: "Track, return, or buy things again",
      icon: Package,
      href: "/account/orders",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      count: userData.orderCount || 0,
    },
    {
      title: "Wishlist",
      description: "Your curated collection of favorites",
      icon: Heart,
      href: "/wishlist",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      count: userData.wishlistCount || 0,
    },
    {
      title: "Your Profile",
      description: "Edit login, name, and mobile number",
      icon: User,
      href: "/account/profile",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section with Lace Texture */}
        <div className="relative overflow-hidden bg-muted/30 pb-12 pt-16 md:pt-24 lace-texture">
          <div className="container relative z-10 mx-auto px-4">
            <div className="flex flex-col items-center text-center md:flex-row md:text-left md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage src={userData.avatar || "/placeholder-avatar.jpg"} alt={userData.name} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-display">
                      {userData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="space-y-1">
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                      {isLoading ? 'Loading...' : `Hello, ${userData.name}`}
                    </h1>
                    <p className="text-muted-foreground">
                      {isLoading ? 'loading@example.com' : userData.email}
                      {userData.isEmailVerified && (
                        <Badge variant="outline" className="ml-2 text-xs bg-green-500/10 text-green-600 border-green-500/20">
                          Verified
                        </Badge>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {userData.role || 'Customer'}
                      </Badge>
                      {userData.createdAt && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Member since {new Date(userData.createdAt).getFullYear()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>


            </div>
          </div>

          {/* Decorative gradient blur */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />
        </div>

        {/* Dashboard Grid */}
        <div className="container mx-auto px-4 py-12 -mt-8 relative z-20">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {accountSections.map((section) => {
              const Icon = section.icon
              return (
                <motion.div key={section.href} variants={item}>
                  <Link href={section.href} className="block h-full group">
                    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 overflow-hidden relative">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div className={`p-3 rounded-xl ${section.bgColor} ${section.color} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          {section.count !== undefined && (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                              {section.count}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="mt-4 text-lg group-hover:text-primary transition-colors">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {section.description}
                        </CardDescription>
                      </CardHeader>

                      {/* Hover indicator */}
                      <div className="absolute bottom-4 right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ChevronRight className="h-5 w-5 text-primary" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Quick Actions / Footer of Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-col items-center justify-center gap-4 border-t pt-8"
          >
            <p className="text-muted-foreground text-sm">
              Need help with your account? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
            </p>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
