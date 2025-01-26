// URZA-C2/next-urza-frontend/frontend/src/app/main/page.tsx

"use client"

import { MainContentWrapper } from "@/components/urza/main-content-wrapper"
import { useContext, useEffect } from "react"
import { AuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { AgentsTable } from "@/components/urza/dashboard/agent-table"
import { ListenersTable } from "@/components/urza/dashboard/listeners-table"
import { TaskingsTable } from "@/components/urza/dashboard/tasking-table"

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
        <AgentsTable />
        <ListenersTable />
        <TaskingsTable />
      </div>
    </MainContentWrapper>
  )
}
