"use client"

import { useRouter, useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LauncherForm } from "@/components/urza/launcher/launcher-form"
import { Zap, Server, Code, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function LauncherPage() {
  const router = useRouter()
  const params = useParams()
  const launcherName = params.name as string
  
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
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">
            {launcherName} Launcher
          </h1>
          <p className="text-sm text-gray-500">
            Stage via CSharp source file
          </p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="host" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Host
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <LauncherForm />
        </TabsContent>

        <TabsContent value="host">
          <div className="text-sm text-gray-500">
            Host configuration options will be displayed here.
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="text-sm text-gray-500">
            Code view will be displayed here.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

