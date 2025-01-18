// next-urza-frontend/frontend/src/app/teamserver-client/page.tsx

"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamServerList } from "@/components/urza/teamserver-client/teamserver-list"
import { TeamServerConnectionForm } from "@/components/urza/teamserver-client/teamserver-connection-form"

export default function TeamServerClientPage() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">TeamServer Client</h1>
      
      <Tabs defaultValue="available-servers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available-servers">Available Servers</TabsTrigger>
          <TabsTrigger value="manual-connect">Manual Connect</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available-servers">
          <TeamServerList />
        </TabsContent>
        
        <TabsContent value="manual-connect">
          <TeamServerConnectionForm onConnect={() => setIsConnected(true)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}