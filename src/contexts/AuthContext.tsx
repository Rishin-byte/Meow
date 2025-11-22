'use client'

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'
import { AuthState, AuthUser } from '@/types'

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isLoading: false, error: null }
    case 'LOGIN_FAILURE':
      return { ...state, user: null, isLoading: false, error: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false, error: null }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    username: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      // Validate token and get user data
      validateToken(token)
    }
  }, [])

  const validateToken = async (token: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: data.data })
        } else {
          localStorage.removeItem('authToken')
        }
      } else {
        localStorage.removeItem('authToken')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      localStorage.removeItem('authToken')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' })

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success && data.data) {
        const { user, token } = data.data
        localStorage.setItem('authToken', token)
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: data.error || 'Login failed' })
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Network error. Please try again.' })
    }
  }

  const register = async (userData: {
    email: string
    username: string
    password: string
    firstName: string
    lastName: string
  }) => {
    try {
      dispatch({ type: 'LOGIN_START' })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok && data.success && data.data) {
        const { user, token } = data.data
        localStorage.setItem('authToken', token)
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: data.error || 'Registration failed' })
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Network error. Please try again.' })
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    dispatch({ type: 'LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}