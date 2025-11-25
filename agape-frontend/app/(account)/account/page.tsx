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
  const { user, isLoading } = useAuth();

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {isLoading ? 'Loading...' : `Hello, ${userData.name}`}
          </h1>
          <p className="text-muted-foreground">
            Welcome back to your dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {userData.role || 'Customer'}
          </Badge>
          {userData.isEmailVerified && (
            <Badge variant="outline" className="text-green-600 border-green-500/20 bg-green-500/10">
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
    </div>
  )
}
