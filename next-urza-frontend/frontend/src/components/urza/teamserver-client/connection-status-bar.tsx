// URZA-C2/next-urza-frontend/frontend/src/components/urza/teamserver-client/connection-status-bar.tsx

"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeamServerConnection } from "@/context/TeamServerConnectionContext";

export function ConnectionStatusBar() {
  const { isConnected, connectedConfig, disconnect } = useTeamServerConnection();

  // Always initialize Hooks
  const [connectionStartTime, setConnectionStartTime] = useState<Date | null>(null);
  const [connectionUptime, setConnectionUptime] = useState<number>(0);

  useEffect(() => {
    if (isConnected && connectedConfig) {
      // If connection just established, set the start time
      if (!connectionStartTime) {
        setConnectionStartTime(new Date());
      }

      // Calculate uptime every second
      const interval = setInterval(() => {
        if (connectionStartTime) {
          const now = new Date();
          const diff = Math.floor((now.getTime() - connectionStartTime.getTime()) / 1000);
          setConnectionUptime(diff);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Reset uptime when disconnected
      setConnectionStartTime(null);
      setConnectionUptime(0);
    }
  }, [isConnected, connectedConfig, connectionStartTime]);

  // Conditional rendering after Hooks
  if (!isConnected || !connectedConfig) return null;

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Badge variant="default">Connected</Badge>
          <span>
            TeamServer: {`${connectedConfig.protocol}://${connectedConfig.host}:${connectedConfig.port}`}
          </span>
          <span>Duration: {formatUptime(connectionUptime)}</span>
        </div>
        <Button variant="outline" onClick={disconnect}>
          Disconnect
        </Button>
      </CardContent>
    </Card>
  );
}
