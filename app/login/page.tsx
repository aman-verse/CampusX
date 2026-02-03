"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type { College } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Utensils, Loader2 } from "lucide-react"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string
              size?: string
              text?: string
              width?: number
            }
          ) => void
        }
      }
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const [colleges, setColleges] = useState<College[]>([])
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null)
  const [isLoadingColleges, setIsLoadingColleges] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [pendingCredential, setPendingCredential] = useState<string | null>(null)

  // Fetch colleges on mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await api.getColleges()
        setColleges(data)
        if (data.length === 1) {
          setSelectedCollegeId(data[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch colleges:", error)
        setLoginError("Failed to load colleges. Please refresh the page.")
      } finally {
        setIsLoadingColleges(false)
      }
    }
    fetchColleges()
  }, [])

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setLoginError(null)

      if (!selectedCollegeId) {
        setPendingCredential(response.credential)
        setLoginError("Please select your college first")
        return
      }

      try {
        const loggedInUser = await login(response.credential, selectedCollegeId)
        // Redirect based on role
        switch (loggedInUser.role) {
          case "vendor":
            router.push("/vendor")
            break
          case "admin":
            router.push("/admin")
            break
          default:
            router.push("/student")
        }
      } catch (error) {
        console.error("Login failed:", error)
        setLoginError(
          error instanceof Error ? error.message : "Login failed. Please try again."
        )
      }
    },
    [login, router, selectedCollegeId]
  )

  // Handle pending credential when college is selected
  useEffect(() => {
    if (pendingCredential && selectedCollegeId) {
      handleCredentialResponse({ credential: pendingCredential })
      setPendingCredential(null)
    }
  }, [selectedCollegeId, pendingCredential, handleCredentialResponse])

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case "vendor":
          router.push("/vendor")
          break
        case "admin":
          router.push("/admin")
          break
        default:
          router.push("/student")
      }
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (initializedRef.current || authLoading || isAuthenticated) return

    const initializeGoogle = () => {
      if (window.google && googleButtonRef.current) {
        initializedRef.current = true
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: handleCredentialResponse,
        })

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: 300,
        })
      }
    }

    if (window.google) {
      initializeGoogle()
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle)
          initializeGoogle()
        }
      }, 100)

      return () => clearInterval(checkGoogle)
    }
  }, [authLoading, isAuthenticated, handleCredentialResponse])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Utensils className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Campus Eats</CardTitle>
            <CardDescription className="mt-2">
              Sign in with your college Google account to order food from campus
              canteens
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* College Selection */}
          <div className="space-y-2">
            <Label htmlFor="college">Select Your College</Label>
            {isLoadingColleges ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={selectedCollegeId?.toString() || ""}
                onValueChange={(value) => setSelectedCollegeId(Number(value))}
              >
                <SelectTrigger id="college">
                  <SelectValue placeholder="Choose your college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id.toString()}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{loginError}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="flex flex-col items-center space-y-4">
            <div ref={googleButtonRef} className="flex justify-center" />
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
