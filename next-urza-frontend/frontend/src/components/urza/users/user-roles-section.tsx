// next-urza-frontend\frontend\src\components\urza\users\user-roles-section.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"

interface UserRolesSectionProps {
  userId: number
  username: string
  currentRole: string
  onSuccess: (message: string) => void
}

export function UserRolesSection({ userId, username, currentRole, onSuccess }: UserRolesSectionProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleRolesUpdate = async () => {
    setErrorMessage("")
    try {
      const payload = { role: selectedRole }
      await apiClient.put(`/users/id/${userId}`, payload)
      onSuccess("Roles updated successfully")
    } catch (err: any) {
      console.error(err)
      // Instead of using a popup, we now update errorMessage which is rendered below.
      if (err.response && err.response.data) {
        setErrorMessage(err.response.data.detail || "Failed to update roles")
      } else {
        setErrorMessage("Failed to update roles")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert className="bg-red-100 border-red-500 text-red-700">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Admin">Administrator</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleRolesUpdate}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Roles
        </Button>
      </CardContent>
    </Card>
  )
}
