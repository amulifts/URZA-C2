// URZA-C2/next-urza-frontend/frontend/src/app/agents/page.tsx

"use client"

import { AgentsContent } from "@/components/urza/agents/agents-content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AgentsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Agents</h1>
            </div>

            <Tabs defaultValue="agents" className="space-y-4">
                <TabsContent value="agents" className="space-y-4">
                    <AgentsContent />
                </TabsContent>
            </Tabs>
        </div>
    )
}

