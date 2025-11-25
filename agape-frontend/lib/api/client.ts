/**
 * Base HTTP client for API requests
 * Handles authentication, error handling, and request/response interceptors
 * @module lib/api/client
 */

import axios, { AxiosError, AxiosInstance } from 'axios'

// Configuration - Base API URL from environment or default to local backend
const API_BASE_URL = 'http://localhost:4000/api/v1'

// Create axios instance with defaults
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: enables httpOnly cookies for JWT tokens
  paramsSerializer: {
    serialize: (params) => {
      // Custom serializer to handle arrays as comma-separated values
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Join array values with comma
          searchParams.append(key, value.join(','))
        } else if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      return searchParams.toString()
    }
  }
})

// Request interceptor - Add auth token and request tracking ID
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }

    // Add unique request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID()
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally, especially 401 for token refresh
apiClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error: AxiosError) => {
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/refresh')) {
      try {
        // Attempt to refresh the access token
        const refreshResponse = await apiClient.post('/auth/refresh')

        // Update token in localStorage if provided
        if (refreshResponse.data?.data?.accessToken) {
          localStorage.setItem('token', refreshResponse.data.data.accessToken)
        }

        // Retry the original request with new token
        if (error.config) {
          // Update the Authorization header with new token
          const newToken = localStorage.getItem('token')
          if (newToken) {
            error.config.headers['Authorization'] = `Bearer ${newToken}`
          }
          return apiClient.request(error.config)
        }
      } catch (refreshError) {
        // Refresh failed - clear auth data and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/auth/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
