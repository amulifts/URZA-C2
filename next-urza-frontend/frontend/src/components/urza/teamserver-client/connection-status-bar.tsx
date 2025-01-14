// next-urza-frontend\frontend\src\components\urza\teamserver-client\connection-status-bar.tsx

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ConnectionStatusBarProps {
  isConnected: boolean
  onDisconnect: () => void
}

export function ConnectionStatusBar({ isConnected, onDisconnect }: ConnectionStatusBarProps) {
  if (!isConnected) return null

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Badge variant="default">Connected</Badge>
          <span>TeamServer: ws://localhost:6000</span>
          <span>Duration: 00:15:32</span>
        </div>
        <Button variant="outline" onClick={onDisconnect}>Disconnect</Button>
      </CardContent>
    </Card>
  )
}

