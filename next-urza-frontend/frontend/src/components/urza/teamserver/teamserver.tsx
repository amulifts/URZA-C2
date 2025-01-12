// next-urza-frontend\frontend\src\components\urza\teamserver\teamserver.tsx

"use client"

import { useState, useEffect } from 'react'
import { Link, Eye, EyeOff, Copy, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { apiClient } from "@/lib/api"

export function TeamServerClientConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionUptime, setConnectionUptime] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [connectionConfig, setConnectionConfig] = useState({
    protocol: 'ws',
    host: 'localhost',
    port: '6000',
    username: 'aman',
    password: 'admin',
  })
  const [rememberCredentials, setRememberCredentials] = useState(false)
  const [showConnectionHistory, setShowConnectionHistory] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isConnected) {
      interval = setInterval(() => {
        setConnectionUptime(prevUptime => prevUptime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isConnected])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleConnect = async () => {
    const { protocol, host, port, username, password } = connectionConfig

    // Basic frontend validation
    if (!protocol || !host || !port || !username || !password) {
      toast.error("All fields are required.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

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
        setIsConnected(true)
        toast.success("Successfully connected to TeamServer", {
          position: "top-right",
          autoClose: 3000,
        })
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

  const handleDisconnect = async () => {
    // Make API call to backend to terminate the client
    try {
      await apiClient.post("/st_client/terminate/", {}) // Assuming this endpoint exists

      setIsConnected(false)
      setConnectionUptime(0)
      toast("Disconnected from TeamServer", {
        type: "default",
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error: any) {
      console.error("Disconnection Error:", error)
      toast.error("Failed to disconnect from TeamServer", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  const handleConfigChange = (key: string, value: string) => {
    setConnectionConfig(prevConfig => ({ ...prevConfig, [key]: value }))
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Link className="h-6 w-6" />
            TeamServer Client Connection
          </CardTitle>
          <CardDescription>Manage your connection to the TeamServer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? "default" : "destructive"} className="text-lg py-1 px-3">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              {isConnected && (
                <div className="text-sm text-gray-500">
                  Uptime: {formatUptime(connectionUptime)}
                </div>
              )}
            </div>
            {isConnected && (
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            )}
          </div>

          {/* Connection Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Server Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Protocol</Label>
                <RadioGroup
                  value={connectionConfig.protocol}
                  onValueChange={(value) => handleConfigChange('protocol', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ws" id="ws" />
                    <Label htmlFor="ws">WS (WebSocket/HTTP)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wss" id="wss" />
                    <Label htmlFor="wss">WSS (WebSocket Secure/HTTPS)</Label>
                  </div>
                </RadioGroup>
              </div>
              {connectionConfig.protocol === 'ws' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Using insecure WebSocket (WS) protocol. It's recommended to use WSS for production environments.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={connectionConfig.host}
                    onChange={(e) => handleConfigChange('host', e.target.value)}
                    placeholder="localhost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={connectionConfig.port}
                    onChange={(e) => handleConfigChange('port', e.target.value)}
                    placeholder="6000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={connectionConfig.username}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                  placeholder="aman"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={connectionConfig.password}
                    onChange={(e) => handleConfigChange('password', e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="remember-credentials"
                  checked={rememberCredentials}
                  onCheckedChange={setRememberCredentials}
                />
                <Label htmlFor="remember-credentials">Remember credentials</Label>
              </div>
            </CardContent>
          </Card>

          {/* Connection Actions */}
          <div className="flex justify-between">
            <Button
              onClick={isConnected ? handleDisconnect : handleConnect}
              className={isConnected ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {isConnected ? "Disconnect" : "Connect"}
            </Button>
          </div>

          {/* Connection Information Display */}
          {isConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Connection Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Connected Server:</strong> {connectionConfig.host}:{connectionConfig.port}
                </div>
                <div>
                  <strong>Protocol:</strong> {connectionConfig.protocol.toUpperCase()}
                </div>
                <div>
                  <strong>Connection String:</strong>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 p-1 rounded">
                      {`${connectionConfig.protocol}://${connectionConfig.username}:${connectionConfig.password}@${connectionConfig.host}:${connectionConfig.port}`}
                    </code>
                    <Button variant="outline" size="icon" onClick={() => {
                      navigator.clipboard.writeText(`${connectionConfig.protocol}://${connectionConfig.username}:${connectionConfig.password}@${connectionConfig.host}:${connectionConfig.port}`)
                      toast.success("Connection string copied to clipboard", {
                        position: "top-right",
                        autoClose: 3000,
                      })
                    }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <strong>Connection Duration:</strong> {formatUptime(connectionUptime)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connection History */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost">Connection History</Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>ws://localhost:6000</span>
                    <Button variant="ghost" size="sm">Connect</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>wss://example.com:6001</span>
                    <Button variant="ghost" size="sm">Connect</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ws://192.168.1.100:6000</span>
                    <Button variant="ghost" size="sm">Connect</Button>
                  </div>
                </div>
              </ScrollArea>
              <Button variant="outline" size="sm">Clear History</Button>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  )
}
