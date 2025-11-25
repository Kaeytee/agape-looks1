"use client"

/**
 * Admin Customers Management Page
 * Allows admins to view, search, and manage all customers
 * @page app/admin/customers
 */

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Search, Filter, Loader2, User, Shield, CheckCircle, XCircle, Mail, Phone, Calendar, AlertCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api/client"
import { toast } from "sonner"

// User interface
interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: "customer" | "admin"
  verified_at: string | null
  created_at: string
  updated_at: string
}

// Hook to fetch users
function useUsers(page: number = 1, limit: number = 20, filters: any = {}) {
  return useQuery({
    queryKey: ['admin-users', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      })
      const response = await apiClient.get(`/admin/users?${params}`)
      return response.data.data
    },
  })
}

// Hook to update user role
function useUpdateUserRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiClient.patch(`/admin/users/${userId}/role`, { role })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User role updated successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to update user role', {
        description: error.response?.data?.message || 'Please try again',
      })
    },
  })
}

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("all")
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)
  const [newRole, setNewRole] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)

  // Build filters
  const filters = React.useMemo(() => {
    const f: any = {}
    if (roleFilter !== "all") f.role = roleFilter
    if (searchQuery) f.search = searchQuery
    return f
  }, [roleFilter, searchQuery])

  // Fetch users
  const { data, isLoading, error } = useUsers(currentPage, 20, filters)
  const updateRoleMutation = useUpdateUserRole()

  // Filtered users (client-side)
  const filteredUsers = React.useMemo(() => {
    if (!data?.users) return []
    return data.users
  }, [data])

  // Handle role update
  const handleUpdateRole = () => {
    if (!selectedUser || !newRole) return
    
    updateRoleMutation.mutate(
      { userId: selectedUser.id, role: newRole },
      {
        onSuccess: () => {
          setRoleDialogOpen(false)
          setSelectedUser(null)
          setNewRole("")
        },
      }
    )
  }

  // Open role dialog
  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setRoleDialogOpen(true)
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Header */}
            <div className="mb-8">
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin Dashboard
                </Link>
              </Button>

              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Customer Management
              </h1>
              <p className="text-muted-foreground">
                View and manage all registered users
              </p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Search */}
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Role Filter */}
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="customer">Customers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading customers...</span>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <p className="text-lg font-semibold mb-2">Failed to load customers</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {(error as any)?.response?.data?.message || 'Please try again later'}
                  </p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </CardContent>
              </Card>
            ) : filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">No customers found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Customers ({data?.pagination?.total || 0})</CardTitle>
                  <CardDescription>
                    Showing {filteredUsers.length} of {data?.pagination?.total || 0} customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user: User) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.phone ? (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{user.phone}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.role === "admin" ? (
                                <Badge variant="default" className="gap-1">
                                  <Shield className="h-3 w-3" />
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="outline">Customer</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.verified_at ? (
                                <Badge variant="success" className="gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Unverified
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{formatDate(user.created_at)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRoleDialog(user)}
                              >
                                Change Role
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {data?.pagination && data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-muted-foreground">
                        Page {data.pagination.page} of {data.pagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === data.pagination.totalPages}
                          onClick={() => setCurrentPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Role Update Dialog */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update User Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="role">New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Warning:</strong> Admins have full access to the admin dashboard and can manage all users, orders, and products.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={updateRoleMutation.isPending || !newRole}
              >
                {updateRoleMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRouteGuard>
  )
}
