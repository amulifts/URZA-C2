// frontend/src/components/urza/teamserver-client/teamserver-connection-form.tsx

"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Eye, EyeOff } from 'lucide-react'
import { toast } from "react-toastify"
import {apiClient} from "@/lib/api"

interface TeamServerConnectionFormProps {
  onConnect: () => void
}

export function TeamServerConnectionForm({ onConnect }: TeamServerConnectionFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [connectionConfig, setConnectionConfig] = useState({
    protocol: 'ws',
    host: 'localhost',
    port: '6000',
    username: 'admin',
    password: '',
  })
  const [rememberCredentials, setRememberCredentials] = useState(false)

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    const { protocol, host, port, username, password } = connectionConfig

    // Basic frontend validation
    if (!protocol || !host || !port || !username || !password) {
      toast.error("All fields are required.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    // Construct the connection URL as per backend expectation
    const connectionURL = `${protocol}://${username}:${password}@${host}:${port}`

    try {
      toast.info("Connecting to TeamServer...", {
        position: "top-right",
        autoClose: 2000,
      })

      const response = await apiClient.post("/st_client/connect/", {
        connection_url: connectionURL
      })

      if (response.status === 200) {
        toast.success("Successfully connected to TeamServer", {
          position: "top-right",
          autoClose: 3000,
        })
        onConnect() // Inform parent component
      } else {
        toast.error("Failed to connect to TeamServer", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error: any) {
      console.error("Connection Error:", error)
      if (error.response && error.response.data) {
        const detail = error.response.data.detail
        if (Array.isArray(detail)) {
          const messages = detail.map((item: any) => item.msg || JSON.stringify(item)).join(', ')
          toast.error(`Error: ${messages}`, {
            position: "top-right",
            autoClose: 3000,
          })
        } else if (typeof detail === 'object') {
          // If detail is a dict, convert it to string
          const messages = Object.values(detail).flat().join(', ')
          toast.error(`Error: ${messages}`, {
            position: "top-right",
            autoClose: 3000,
          })
        } else {
          toast.error(`Error: ${detail}`, {
            position: "top-right",
            autoClose: 3000,
          })
        }
      } else {
        toast.error("An error occurred while connecting.", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    }
  }

  

  const handleConfigChange = (key: string, value: string) => {
    setConnectionConfig(prevConfig => ({ ...prevConfig, [key]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect to TeamServer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <Label>Protocol</Label>
            <RadioGroup
              value={connectionConfig.protocol}
              onValueChange={(value) => handleConfigChange('protocol', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ws" id="ws" />
                <Label htmlFor="ws">WS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wss" id="wss" />
                <Label htmlFor="wss">WSS</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              name="host"
              value={connectionConfig.host}
              onChange={(e) => handleConfigChange('host', e.target.value)}
              placeholder="Enter host or IP"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              name="port"
              value={connectionConfig.port}
              onChange={(e) => handleConfigChange('port', e.target.value)}
              placeholder="Enter port"
              required
              type="number"
              min="1"
              max="65535"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={connectionConfig.username}
              onChange={(e) => handleConfigChange('username', e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={connectionConfig.password}
                onChange={(e) => handleConfigChange('password', e.target.value)}
                placeholder="Enter password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full">Connect</Button>
        </form>
      </CardContent>
    </Card>
  )
}
