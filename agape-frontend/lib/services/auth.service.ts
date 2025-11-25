/**
 * Authentication Service
 * Handles user registration, login, logout, and token management
 * @module lib/services/auth
 */

import apiClient from '../api/client'

// Type definitions for authentication
export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: string
  verified: boolean
}

export interface AuthResponse {
  user: User
  accessToken?: string
}

/**
 * Authentication Service Class
 * Provides methods for user authentication and account management
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data)
    // Backend wraps response in { status, message, data: {...} }
    return response.data.data || response.data
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data)
    // Backend wraps response in { status, message, data: {...} }
    return response.data.data || response.data
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me')
    return response.data
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await apiClient.post('/auth/refresh')
    // Backend wraps response in { status, data: { accessToken: "..." } }
    return response.data.data || response.data
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password-reset-request', { email })
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/password-reset', { token, password })
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token })
  }

  /**
   * Get user's active sessions
   */
  async getSessions(): Promise<any[]> {
    const response = await apiClient.get('/auth/sessions')
    // Backend wraps response in { status, data: { sessions: [...] } }
    return response.data.data?.sessions || response.data.sessions || response.data
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${sessionId}`)
  }
}

// Export singleton instance
export const authService = new AuthService()
