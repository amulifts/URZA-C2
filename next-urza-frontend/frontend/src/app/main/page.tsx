// next-urza-frontend\frontend\src\app\main\page.tsx

"use client"

import { MainContentWrapper } from "@/components/urza/main-content-wrapper"
import { useContext, useEffect } from "react"
import { AuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, loading } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <MainContentWrapper>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="space-y-6">
        <p>Welcome, {user?.full_name || user?.username}!</p>
        <p>Your role: {user?.role}</p>
      </div>
    </MainContentWrapper>
  )
}
