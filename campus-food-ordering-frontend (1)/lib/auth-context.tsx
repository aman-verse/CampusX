"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react"
import { api } from "./api"
import type { User, UserRole } from "./types"
import { redirect } from "next/dist/server/api-utils"

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
  const redirected = useRef(false)
  const fetchUser = useCallback(async () => {
    const token = api.getToken()


if (!token) {
  setIsLoading(false)
  return
}

try {
  const me = await api.getCurrentUser()

  setUser(me)

  if (typeof window !== "undefined"  && !redirected.current) {
    redirected.current = true
    let target = ""

    switch (me.role) {
      case "student":
        target = "/student/dashboard"
        break
      case "vendor":
        target = "/vendor"
        break
      case "admin":
        target = "/admin"
        break
      case "superadmin":
        target = "/superadmin"
        break
    }

    // ✅ redirect only if not already on that page
    if (target && window.location.pathname !== target) {
      window.location.href = target
    }
  }

} catch (error) {
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

const me = await api.getCurrentUser()

if (typeof window !== "undefined") {
  localStorage.setItem("user", JSON.stringify(me))
  localStorage.setItem("selected_college_id", String(collegeId))
}

setUser(me)
return me


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
