// URZA-C2/next-urza-frontend/frontend/src/components/urza/listeners/create/create-wmi-listener.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function CreateWmiListener() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    domain: "",
    username: "",
    password: "",
    hash: "",
    checkInterval: "10",
    wmiClass: "Win32_OSRecoveryConfiguration",
    wmiAttribute: "DebugFilePath",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add your form submission logic here
    router.push("/listeners")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input 
              value="Listens on WMI protocol."
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter listener name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="host" className="flex items-center gap-1">
              Host<span className="text-red-500">*</span>
            </Label>
            <Input
              id="host"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              placeholder="Enter host"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain" className="flex items-center gap-1">
                Domain<span className="text-red-500">*</span>
              </Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="Enter domain"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-1">
                Username<span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hash">Hash</Label>
              <Input
                id="hash"
                value={formData.hash}
                onChange={(e) => setFormData({ ...formData, hash: e.target.value })}
                placeholder="Enter hash"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkInterval" className="flex items-center gap-1">
              CheckInterval<span className="text-red-500">*</span>
            </Label>
            <Input
              id="checkInterval"
              value={formData.checkInterval}
              onChange={(e) => setFormData({ ...formData, checkInterval: e.target.value })}
              placeholder="10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wmiClass" className="flex items-center gap-1">
              WMIClass<span className="text-red-500">*</span>
            </Label>
            <Input
              id="wmiClass"
              value={formData.wmiClass}
              onChange={(e) => setFormData({ ...formData, wmiClass: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wmiAttribute" className="flex items-center gap-1">
              WMIAttribute<span className="text-red-500">*</span>
            </Label>
            <Input
              id="wmiAttribute"
              value={formData.wmiAttribute}
              onChange={(e) => setFormData({ ...formData, wmiAttribute: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Comms</Label>
            <Input 
              value="WMI"
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

