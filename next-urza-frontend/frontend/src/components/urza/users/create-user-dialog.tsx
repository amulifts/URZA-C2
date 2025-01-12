// next-urza-frontend\frontend\src\components\urza\users\create-user-dialog.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"

interface CreateUserDialogProps {
  onUserCreated: () => void;
}

export function CreateUserDialog({ onUserCreated }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm_password: "",
    full_name: "",
  })
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (formData.password !== formData.confirm_password) {
      setErrorMessage("Passwords do not match.")
      return
    }

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirm_password,
        full_name: formData.full_name || undefined,
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/create`,
        payload,
        { withCredentials: true }
      )

      if (response.status === 200) {
        setSuccessMessage(`User '${response.data.username}' created successfully!`)
        onUserCreated()
        // Clear form data
        setFormData({ username: "", password: "", confirm_password: "", full_name: "" })
        // Close dialog after a short delay
        setTimeout(() => {
          setOpen(false)
          setSuccessMessage("")
        }, 1500)
      }
    } catch (err: any) {
      console.error(err)
      if (err.response && err.response.data && err.response.data.detail) {
        let detail = err.response.data.detail
        // If the detail is an object or an array, convert it to a string.
        if (typeof detail === "object") {
          if (Array.isArray(detail)) {
            detail = detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ")
          } else {
            detail = JSON.stringify(detail)
          }
          setErrorMessage(detail)
        } else {
          setErrorMessage(err.response.data.detail)
        }
      } else {
        setErrorMessage("An error occurred.")
      }
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setErrorMessage("")
      setSuccessMessage("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Create a new user account. Fill in the details and click Create.
            </DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <Alert className="mt-4 bg-red-100 border-red-500 text-red-700">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="mt-4 bg-green-100 border-green-500 text-green-700">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter username"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={(e) =>
                  setFormData({ ...formData, confirm_password: e.target.value })
                }
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
