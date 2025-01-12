// next-urza-frontend\frontend\src\app\layout.tsx

"use client"

import "./globals.css"
import React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/context/AuthContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Geist } from "next/font/google"

const geist = Geist({ subsets: ["latin"] })

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/urza/layout"

function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Do not show sidebar on login or register pages
  const hideSidebar = pathname === "/login" || pathname === "/register"
  
  return (
    <div className="h-full relative">
      {!hideSidebar && (
        <div className="hidden h-full md:flex md:w-80 md:flex-col md:fixed md:inset-y-0 z-50 bg-gray-50">
          <Sidebar />
        </div>
      )}
      
      <main className={`${!hideSidebar ? "md:pl-80" : ""} flex-1 flex flex-col min-h-screen bg-gray-50 p-4`}>
        <div className="flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
          <SidebarWrapper>
            {children}
            <ToastContainer />
          </SidebarWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
