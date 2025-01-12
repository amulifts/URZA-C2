// next-urza-frontend\frontend\src\components\urza\users\user-theme-section.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"

interface UserThemeSectionProps {
  username: string
  onSuccess: (message: string) => void
}

export function UserThemeSection({ username }: UserThemeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Manage user theme preferences</CardDescription>
      </CardHeader>
      <CardContent className="text-center text-xl font-semibold">
        UPCOMING Feature!
      </CardContent>
    </Card>
  )
}
