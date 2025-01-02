// next-urza-frontend\frontend\src\app\main\page.tsx

import { MainContentWrapper } from "@/components/urza/main-content-wrapper"

export default function DashboardPage() {
  return (
    <MainContentWrapper>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="space-y-6">
        <p>Welcome to your Dashboard!</p>
      </div>
    </MainContentWrapper>
  )
}

