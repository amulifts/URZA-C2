// URZA-C2/next-urza-frontend/frontend/src/app/listeners/page.tsx

"use client"

import { ListenersContent } from "@/components/urza/listeners/listeners-content"
import { ProfilesTable } from "@/components/urza/listeners/profile-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Radio, Settings } from 'lucide-react'

export default function ListenersPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Listeners</h1>
            </div>

            <Tabs defaultValue="listeners" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="listeners" className="flex items-center gap-2">
                        <Radio className="h-4 w-4" />
                        Listeners
                    </TabsTrigger>
                    <TabsTrigger value="profiles" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Profiles
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="listeners" className="space-y-4">
                    <ListenersContent />
                </TabsContent>

                <TabsContent value="profiles" className="space-y-4">
                    <ProfilesTable />
                </TabsContent>
            </Tabs>
        </div>
    )
}

