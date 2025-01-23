// URZA-C2/next-urza-frontend/frontend/src/app/listeners/create/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from 'lucide-react'
import { CreateHttpListener } from "@/components/urza/listeners/create/create-http-listener"
import { CreateHttpsListener } from "@/components/urza/listeners/create/create-https-listener"
import { CreateWmiListener } from "@/components/urza/listeners/create/create-wmi-listener"

export default function CreateListenerPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("http")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Create Listener</h1>
      </div>

      <Tabs defaultValue="http" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="http">HTTP Listener</TabsTrigger>
          <TabsTrigger value="https">HTTPS Listener</TabsTrigger>
          <TabsTrigger value="wmi">WMI Listener</TabsTrigger>
        </TabsList>

        <TabsContent value="http">
          <CreateHttpListener />
        </TabsContent>

        <TabsContent value="https">
          <CreateHttpsListener />
        </TabsContent>

        <TabsContent value="wmi">
          <CreateWmiListener />
        </TabsContent>
      </Tabs>
    </div>
  )
}

