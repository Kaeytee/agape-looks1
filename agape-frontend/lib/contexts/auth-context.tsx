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
			setIsLoading(true)
			const userData = await getCurrentUser()
			setUser(userData)
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
			}
		} finally {
			setIsLoading(false)
		}
	}, [])

	React.useEffect(() => {
		fetchUser()
	}, [fetchUser])

	const login = React.useCallback((userData: User) => {
		setUser(userData)
		localStorage.setItem('user_role', userData.role)
		// Optionally persist basic user info if needed, but state is enough for runtime
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
