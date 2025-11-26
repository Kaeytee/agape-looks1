"use client"

import * as React from "react"
import { getCurrentUser } from "@/lib/api/users"
import { type User } from "@/lib/types"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
	user: User | null
	isLoading: boolean
	error: Error | null
	login: (user: User) => void
	logout: () => void
	refreshUser: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<User | null>(null)

	// Start loading to match server state, then check localStorage in useEffect
	const [isLoading, setIsLoading] = React.useState<boolean>(true)

	const [error, setError] = React.useState<Error | null>(null)
	const router = useRouter()
	const pathname = usePathname()

	const fetchUser = React.useCallback(async () => {
		// Check for token in localStorage (apiClient uses 'token')
		const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;

		if (!token) {
			setIsLoading(false);
			setUser(null);
			return;
		}

		try {
			// Only set loading if we don't have a user (initial load without cache)
			// We check localStorage here because 'user' state might be stale in this closure
			const hasCachedUser = typeof window !== 'undefined' && localStorage.getItem('user');
			if (!user && !hasCachedUser) {
				setIsLoading(true)
			}

			const userData = await getCurrentUser()
			setUser(userData)
			// Update cached user
			localStorage.setItem('user', JSON.stringify(userData))
			setError(null)
		} catch (err: any) {
			console.error("Failed to fetch user in AuthProvider:", err)
			setError(err)
			// If 401, clear user
			if (err?.response?.status === 401) {
				setUser(null)
				localStorage.removeItem('accessToken')
				localStorage.removeItem('token')
				localStorage.removeItem('refreshToken')
				localStorage.removeItem('user')
				localStorage.removeItem('user_role')
			}
		} finally {
			setIsLoading(false)
		}
	}, []) // Keep dependency array empty to prevent infinite loops

	React.useEffect(() => {
		// Optimistic restore on mount
		if (typeof window !== 'undefined') {
			const savedUser = localStorage.getItem('user')
			if (savedUser) {
				try {
					setUser(JSON.parse(savedUser))
					// If we have a cached user, we can show the UI immediately
					setIsLoading(false)
				} catch (e) {
					console.error("Failed to parse user from localStorage", e)
				}
			}
		}
		fetchUser()
	}, [fetchUser])

	const login = React.useCallback((userData: User) => {
		setUser(userData)
		localStorage.setItem('user', JSON.stringify(userData))
		localStorage.setItem('user_role', userData.role)
	}, [])

	const logout = React.useCallback(() => {
		setUser(null)
		localStorage.removeItem('accessToken')
		localStorage.removeItem('token')
		localStorage.removeItem('refreshToken')
		localStorage.removeItem('user')
		localStorage.removeItem('user_role')
		router.push('/auth/login')
	}, [router])

	const refreshUser = React.useCallback(async () => {
		await fetchUser()
	}, [fetchUser])

	return (
		<AuthContext.Provider value={{ user, isLoading, error, login, logout, refreshUser }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = React.useContext(AuthContext)
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
