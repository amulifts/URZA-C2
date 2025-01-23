// next-urza-frontend/frontend/src/app/teamserver-client/page.tsx

"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectionStatusBar } from "@/components/urza/teamserver-client/connection-status-bar"
import { TeamServerList } from "@/components/urza/teamserver-client/teamserver-list"
import { TeamServerClientConnection } from "@/components/urza/teamserver-client/teamserver-client-connection"

export default function TeamServerClientPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">TeamServer Client</h1>

      <ConnectionStatusBar />

      <Tabs defaultValue="available-servers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available-servers">Available Servers</TabsTrigger>
          <TabsTrigger value="manual-connect">Manual Connect</TabsTrigger>
        </TabsList>

        <TabsContent value="available-servers">
          <TeamServerList />
        </TabsContent>

        <TabsContent value="manual-connect">
          <TeamServerClientConnection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
