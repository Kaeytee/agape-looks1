"use client"

import * as React from "react"
import Link from "next/link"
import { Package, Heart, MapPin, User, Settings, LogOut } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const accountSections = [
  {
    title: "Orders",
    description: "View and track your orders",
    icon: Package,
    href: "/account/orders",
    count: 3,
  },
  {
    title: "Wishlist",
    description: "Your saved items",
    icon: Heart,
    href: "/wishlist",
    count: 5,
  },
  {
    title: "Addresses",
    description: "Manage shipping addresses",
    icon: MapPin,
    href: "/account/addresses",
    count: 2,
  },
  {
    title: "Profile",
    description: "Update your information",
    icon: User,
    href: "/account/profile",
  },
  {
    title: "Settings",
    description: "Account preferences",
    icon: Settings,
    href: "/account/settings",
  },
]

export default function AccountPage() {
  // Get user from localStorage (set during login)
  const [userName, setUserName] = React.useState<string>("")

  React.useEffect(() => {
    // Get user data from localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserName(user.name || user.email || "User")
      } catch (e) {
        setUserName("User")
      }
    } else {
      setUserName("User")
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">My Account</h1>
            <p className="text-lg text-muted-foreground">Welcome back, {userName}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accountSections.map((section) => {
              const Icon = section.icon
              return (
                <Link key={section.href} href={section.href}>
                  <Card className="h-full hover:shadow-card-hover transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            {section.count !== undefined && (
                              <span className="text-sm text-muted-foreground">{section.count} items</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>

          <div className="mt-8">
            <Button variant="outline" className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
