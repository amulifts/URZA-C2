// next-urza-frontend\frontend\src\app\layout.tsx

import "./globals.css"
import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Next-Urza Demo",
  description: "Root layout with no navbar on login page",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* 
        We do NOT include a navbar here, so the login page is plain 
      */}
      <body>
        {children}
      </body>
    </html>
  )
}


