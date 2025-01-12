// next-urza-frontend\frontend\src\app\users\page.tsx

"use client"

import { UsersTable } from "@/components/urza/users/users-table"
import { ThemesTable } from "@/components/urza/users/themes-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Palette } from 'lucide-react'

export default function UsersPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="themes" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Themes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <UsersTable />
                </TabsContent>

                <TabsContent value="themes" className="space-y-4">
                    <ThemesTable />
                </TabsContent>
            </Tabs>
        </div>
    )
}

