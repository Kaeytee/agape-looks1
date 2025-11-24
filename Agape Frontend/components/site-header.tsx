"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Search, ShoppingCart, User, X, Heart, LogOut, UserCircle, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { cn } from "@/lib/utils"
import { SITE_CONFIG } from "@/lib/constants"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/contexts/wishlist-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Shop", href: "/shop" },
  { name: "Collections", href: "/collections" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [userName, setUserName] = React.useState("")
  const [userRole, setUserRole] = React.useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount, openCart } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const headerRef = React.useRef<HTMLDivElement>(null)

  // Check authentication state
  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          setIsAuthenticated(true)
          setUserName(user.name || user.email || "User")
          setUserRole(user.role || "customer")
        } catch (e) {
          setIsAuthenticated(false)
          setUserName("")
          setUserRole("")
        }
      } else {
        setIsAuthenticated(false)
        setUserName("")
        setUserRole("")
      }
    }
    
    checkAuth()
    // Listen for storage changes and custom login event
    window.addEventListener("storage", checkAuth)
    window.addEventListener("login", checkAuth)
    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener("login", checkAuth)
    }
  }, [])

  // Also check on pathname changes (navigation)
  React.useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setIsAuthenticated(true)
        setUserName(user.name || user.email || "User")
        setUserRole(user.role || "customer")
      } catch (e) {
        setIsAuthenticated(false)
        setUserName("")
        setUserRole("")
      }
    } else {
      setIsAuthenticated(false)
      setUserName("")
      setUserRole("")
    }
  }, [pathname])

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    setUserName("")
    router.push("/")
  }

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menus on route change
  React.useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
        setIsSearchOpen(false)
      }
    }

    if (isMenuOpen || isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen, isSearchOpen])

  return (
    <>
      {/* Floating pill navbar */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 pt-4 px-4">
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "max-w-7xl mx-auto rounded-full backdrop-blur-md shadow-lg transition-all duration-300 relative overflow-hidden",
            "bg-gradient-to-r from-primary/10 via-card/95 to-accent/10",
            "border-2 border-primary/20",
            isScrolled && "shadow-xl shadow-primary/20",
          )}
        >
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
          <div className="relative flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 w-full">
            {/* Logo - Left - Dynamic text size */}
            <Link href="/" className="flex items-center flex-shrink-0 z-10">
              <span className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-black dark:text-white">
                {SITE_CONFIG.name}
              </span>
            </Link>

            {/* Desktop navigation - Center */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-all duration-300 hover:text-primary relative py-2 whitespace-nowrap",
                    pathname === item.href ? "text-primary font-bold" : "text-muted-foreground hover:scale-105",
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full shadow-lg shadow-primary/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 z-10">
              {/* Search icon - Hides first (below lg) */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist with badge - Hides second (below md) */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden md:flex"
                asChild
              >
                <Link href="/wishlist" aria-label={`Wishlist with ${wishlistCount} items`}>
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge
                      variant="gold"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* User Profile Dropdown / Login - Hides third (below sm) */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden sm:inline-flex gap-2">
                      <UserCircle className="h-5 w-5" />
                      <span className="max-w-[100px] truncate hidden lg:inline">{userName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userRole === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer bg-primary/10">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Account Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="cursor-pointer">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="cursor-pointer">
                        <Heart className="h-4 w-4 mr-2" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/auth/login">Login</Link>
                </Button>
              )}

              {/* Cart with badge - Always visible */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={openCart}
                aria-label={`Shopping cart with ${itemCount} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge
                    variant="gold"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden ml-1 sm:ml-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search bar dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto mt-2 px-4"
            >
              <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-4 backdrop-blur-md">
                <SearchBar 
                  autoFocus 
                  onClose={() => setIsSearchOpen(false)}
                  className="border-0"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-4 right-4 z-40 lg:hidden"
          >
            <div className="bg-card rounded-3xl shadow-xl border border-border/50 backdrop-blur-md overflow-hidden">
              <nav className="p-6 flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-primary py-2",
                      pathname === item.href ? "text-foreground font-semibold" : "text-muted-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border space-y-3">
                  {isAuthenticated ? (
                    <>
                      {userRole === "admin" && (
                        <Button variant="ghost" asChild className="w-full justify-start bg-primary/10">
                          <Link href="/admin">
                            <Shield className="h-5 w-5 mr-2" />
                            Admin Dashboard
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link href="/account">
                          <User className="h-5 w-5 mr-2" />
                          Account
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          localStorage.removeItem("token")
                          localStorage.removeItem("user")
                          setIsAuthenticated(false)
                          window.location.href = "/"
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/auth/login">
                        <User className="h-5 w-5 mr-2" />
                        Login
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" asChild className="w-full justify-start relative">
                    <Link href="/wishlist">
                      <Heart className="h-5 w-5 mr-2" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <Badge variant="gold" className="ml-auto">
                          {wishlistCount}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start relative"
                    onClick={openCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Cart
                    {itemCount > 0 && (
                      <Badge variant="gold" className="ml-auto">
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-24" />
    </>
  )
}
