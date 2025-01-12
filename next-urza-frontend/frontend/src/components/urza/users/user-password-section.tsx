// next-urza-frontend\frontend\src\components\urza\users\user-password-section.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Trash2 } from 'lucide-react'
import { apiClient } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserPasswordSectionProps {
  userId: number
  username: string
  onSuccess: (message: string) => void
}

export function UserPasswordSection({ userId, username, onSuccess }: UserPasswordSectionProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  })
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    try {
      const payload: any = {}
      if (formData.fullName) {
        payload.full_name = formData.fullName
      }
      if (formData.password) {
        payload.password = formData.password
      }
      if (Object.keys(payload).length === 0) {
        setErrorMessage("Please update full name and/or password")
        return
      }
      await apiClient.put(`/users/id/${userId}`, payload)
      onSuccess("User info updated successfully")
      setFormData({ fullName: "", password: "", confirmPassword: "" })
    } catch (err) {
      console.error(err)
      setErrorMessage("Failed to update user info")
    }
  }

  const handleDelete = async () => {
    setDeleteErrorMessage("")
    setDeleteDialogOpen(false)
    try {
      await apiClient.delete(`/users/id/${userId}`)
      onSuccess("User deleted successfully")
      // Optionally redirect after deletion, e.g., router.push("/users")
    } catch (err: any) {
      console.error(err)
      if (err.response && err.response.data && err.response.data.detail) {
        setDeleteErrorMessage(err.response.data.detail)
      } else {
        setDeleteErrorMessage("Failed to delete user")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Info</CardTitle>
        <CardDescription>Manage user credentials and account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
      {deleteErrorMessage && (
                  <Alert className="bg-red-100 border-red-500 text-red-700">
                    <AlertDescription>{deleteErrorMessage}</AlertDescription>
                  </Alert>
                )}
        <div className="space-y-2">
          <Label>Username</Label>
          <Input value={username} disabled className="bg-gray-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter new full name"
          />
        </div>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>
          
          <div className="flex justify-between">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Pencil className="h-4 w-4 mr-2" />
              Update Info
            </Button>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this user? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
