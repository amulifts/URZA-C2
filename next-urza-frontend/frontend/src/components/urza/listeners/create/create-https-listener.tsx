// URZA-C2/next-urza-frontend/frontend/src/components/urza/listeners/create/create-https-listener.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export function CreateHttpsListener() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    bindAddress: "0.0.0.0",
    bindPort: "443",
    cert: null as File | null,
    key: null as File | null,
    regenCert: false,
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
              value="Listens on HTTPS protocol."
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bindAddress" className="flex items-center gap-1">
                BindAddress<span className="text-red-500">*</span>
              </Label>
              <Input
                id="bindAddress"
                value={formData.bindAddress}
                onChange={(e) => setFormData({ ...formData, bindAddress: e.target.value })}
                placeholder="0.0.0.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bindPort" className="flex items-center gap-1">
                BindPort<span className="text-red-500">*</span>
              </Label>
              <Input
                id="bindPort"
                value={formData.bindPort}
                onChange={(e) => setFormData({ ...formData, bindPort: e.target.value })}
                placeholder="443"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cert">SSL Certificate</Label>
            <Input
              id="cert"
              type="file"
              onChange={(e) => setFormData({ ...formData, cert: e.target.files?.[0] || null })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">SSL Key</Label>
            <Input
              id="key"
              type="file"
              onChange={(e) => setFormData({ ...formData, key: e.target.files?.[0] || null })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="regen-cert"
              checked={formData.regenCert}
              onCheckedChange={(checked) => setFormData({ ...formData, regenCert: checked })}
            />
            <Label htmlFor="regen-cert">Regenerate TLS cert</Label>
          </div>

          <div className="space-y-2">
            <Label>Comms</Label>
            <Input 
              value="HTTPS"
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

