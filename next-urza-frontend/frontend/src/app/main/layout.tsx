// next-urza-frontend\frontend\src\app\main\layout.tsx

import React from "react"
import { Sidebar } from '@/components/urza/layout'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-80 md:flex-col md:fixed md:inset-y-0 z-50 bg-gray-50">
        <Sidebar />
      </div>
      <main className="md:pl-80 flex-1 flex flex-col min-h-screen bg-gray-50 p-4">
        <div className="flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
