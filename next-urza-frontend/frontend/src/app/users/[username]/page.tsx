// next-urza-frontend\frontend\src\app\users\[username]\page.tsx

"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPasswordSection } from "@/components/urza/users/user-password-section"
import { UserThemeSection } from "@/components/urza/users/user-theme-section"
import { UserRolesSection } from "@/components/urza/users/user-roles-section"
import { apiClient } from "@/lib/api"
import { AuthContext } from "@/context/AuthContext"

interface UserDetail {
  id: number
  username: string
  full_name?: string
  role: string
}

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const usernameParam = params.username as string
  const { user: loggedInUser, setUser } = useContext(AuthContext)

  const [successMessage, setSuccessMessage] = useState("")
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [error, setError] = useState("")

  const handleSuccess = (message: string) => {
    setSuccessMessage(message)
    // After displaying success message, refresh user data if the user is updating their own account.
    if (loggedInUser && loggedInUser.username.toLowerCase() === usernameParam.toLowerCase()) {
      refreshUserData()
    }
    setTimeout(() => setSuccessMessage(""), 5000)
  }

  const refreshUserData = useCallback(async () => {
    try {
      // If the URL is for the logged in user, call /users/me
      if (loggedInUser && loggedInUser.username.toLowerCase() === usernameParam.toLowerCase()) {
        const res = await apiClient.get("/users/me")
        setUserDetail(res.data)
        // Additionally, update the AuthContext if needed:
        setUser(res.data)
      } else {
        // Otherwise, load from /users/list and filter
        const res = await apiClient.get("/users/list")
        const found = res.data.find(
          (u: UserDetail) => u.username.toLowerCase() === usernameParam.toLowerCase()
        )
        if (found) {
          setUserDetail(found)
        } else {
          setError("User not found")
        }
      }
      setError("")
    } catch (err: any) {
      console.error(err)
      setError("Failed to fetch user details.")
    }
  }, [loggedInUser, usernameParam, setUser])

  useEffect(() => {
    refreshUserData()
  }, [refreshUserData])

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  if (!userDetail) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">
          User: <span className="text-blue-600">{usernameParam}</span>
        </h1>
      </div>

      {successMessage && (
        <Alert className="bg-green-100 border-green-500 text-green-700">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        <UserPasswordSection
          userId={userDetail.id}
          username={userDetail.username}
          onSuccess={handleSuccess}
        />
        <UserThemeSection
          username={userDetail.username}
          onSuccess={handleSuccess}
        />
        {loggedInUser &&
        (loggedInUser.role === "Admin" ||
          loggedInUser.username.toLowerCase() !== usernameParam.toLowerCase()) ? (
          <UserRolesSection
            userId={userDetail.id}
            username={userDetail.username}
            currentRole={userDetail.role}
            onSuccess={handleSuccess}
          />
        ) : null}
      </div>
    </div>
  )
}
