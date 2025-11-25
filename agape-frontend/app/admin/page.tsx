"use client"
import Link from "next/link"
import { Package, ShoppingCart, Users, TrendingUp, Plus } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminRouteGuard } from "@/components/admin-route-guard"

const stats = [
  {
    title: "Total Products",
    value: "24",
    change: "+2 this month",
    icon: Package,
  },
  {
    title: "Total Orders",
    value: "156",
    change: "+12 this week",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    value: "89",
    change: "+5 this week",
    icon: Users,
  },
  {
    title: "Revenue",
    value: "GHS 45,230",
    change: "+18% this month",
    icon: TrendingUp,
  },
]

export default function AdminPage() {
  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

      <main id="main-content" className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your Agape looks store</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/products">
              <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>Products</CardTitle>
                      <CardDescription>Manage inventory</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/orders">
              <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>Orders</CardTitle>
                      <CardDescription>Process orders</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/customers">
              <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>Customers</CardTitle>
                      <CardDescription>View customers</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      </div>
    </AdminRouteGuard>
  )
}
