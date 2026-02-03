"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { api } from "./api"
import type { User, UserRole } from "./types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (idToken: string, collegeId: number) => Promise<User>
  logout: () => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = api.getToken()

    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      // 🔐 validate token with backend
      const me = await api.getCurrentUser()

      setUser(me)

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(me))
      }
    } catch (error) {
      // ❌ token expired / invalid
      api.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])


  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (idToken: string, collegeId: number): Promise<User> => {
    const response = await api.googleLogin(idToken, collegeId)
    api.setToken(response.access_token)
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("selected_college_id", String(collegeId))
    }
    setUser(response.user)
    return response.user
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
