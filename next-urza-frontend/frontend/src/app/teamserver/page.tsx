// next-urza-frontend/frontend/src/app/teamserver/page.tsx

"use client"

import { TeamServerClientConnection } from "@/components/urza/teamserver/teamserver"
import { useContext, useEffect } from "react"
import { AuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function TeamServerPage() {
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
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">TeamServer</h1>
      <TeamServerClientConnection />
    </div>
  )
}
