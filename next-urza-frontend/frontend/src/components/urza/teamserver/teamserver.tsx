// next-urza-frontend/frontend/src/components/urza/teamserver/teamserver.tsx

"use client"

import { useState, useEffect } from 'react'
import { Server, Eye, EyeOff, Copy, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TableCell } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiClient } from "@/lib/api"
import { toast } from "react-toastify"

export interface LogEntry {
  time: string
  level: string
  message: string
  name: string
  filename: string
  lineno: number
  funcName: string
}

export function TeamServer() {
  const [isRunning, setIsRunning] = useState(false)
  const [uptime, setUptime] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [secureMode, setSecureMode] = useState(false)
  const [serverConfig, setServerConfig] = useState({
    ipBinding: '0.0.0.0',
    port: '6000',
    password: '',
  })
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isFetchingLogs, setIsFetchingLogs] = useState(false)
  const [logLevel, setLogLevel] = useState<string | null>('ALL')

  const [connectedClients, setConnectedClients] = useState<Set<string>>(new Set())

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setUptime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    const fetchLogs = async () => {
      setIsFetchingLogs(true)
      try {
        const params: any = { limit: 100 }
        if (logLevel) params.level = logLevel
        const response = await apiClient.get("/st_teamserver/logs/", { params })
        if (response.status === 200) {
          setLogs(response.data)
        }
      } catch (error: any) {
        console.error(error)
        if (error.response) {
          if (error.response.status === 500) {
            toast.error("Failed to fetch logs: Log file not found or malformed.")
          } else {
            toast.error(error.response.data.detail || "Failed to fetch logs.")
          }
        } else {
          toast.error("Network error: Unable to reach the server.")
        }
      } finally {
        setIsFetchingLogs(false)
      }
    }

    if (isRunning) {
      fetchLogs()
      const logInterval = setInterval(fetchLogs, 5000)
      return () => clearInterval(logInterval)
    }
  }, [isRunning, logLevel])

  useEffect(() => {
    if (!isRunning) {
      setConnectedClients(new Set())
      return
    }

    const clientSet = new Set<string>()
    logs.forEach(log => {
      const message = log.message.toLowerCase()
      const connectMatch = log.message.match(/new client connected\s+([\w@.]+)/i)
      if (connectMatch && connectMatch[1]) {
        clientSet.add(connectMatch[1])
      }
      const disconnectMatch = log.message.match(/client disconnected\s+([\w@.]+)/i)
      if (disconnectMatch && disconnectMatch[1]) {
        clientSet.delete(disconnectMatch[1])
      }
    })
    setConnectedClients(clientSet)
  }, [logs, isRunning])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleConfigChange = (key: string, value: string | boolean) => {
    setServerConfig(prev => ({ ...prev, [key]: value }))
  }

  const generateSecurePassword = () => {
    const password = Math.random().toString(36).slice(-10)
    handleConfigChange('password', password)
  }

  const startTeamServer = async () => {
    if (isRunning) {
      toast.error("TeamServer is already running.")
      return
    }

    if (!serverConfig.password) {
      toast.error("Password is required to start TeamServer.")
      return
    }

    try {
      const response = await apiClient.post("/st_teamserver/start/", {
        host: serverConfig.ipBinding,
        password: serverConfig.password,
        port: parseInt(serverConfig.port),
        secure: secureMode,
      })
      if (response.status === 200) {
        setIsRunning(true)
        setUptime(0)
        toast.success("TeamServer started successfully.")
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.detail || "Failed to start TeamServer.")
    }
  }

  const stopTeamServer = async () => {
    if (!isRunning) {
      toast.error("TeamServer is not running.")
      return
    }
    try {
      const response = await apiClient.post("/st_teamserver/stop/")
      if (response.status === 200) {
        setIsRunning(false)
        setUptime(0)
        setLogs([])
        setConnectedClients(new Set())
        toast.success(response.data.detail || "TeamServer stopped successfully.")
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.detail || "Failed to stop TeamServer.")
    }
  }

  const handleStartStop = () => {
    if (isRunning) {
      stopTeamServer()
    } else {
      startTeamServer()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Server className="h-6 w-6" />
            TeamServer Control Panel
          </CardTitle>
          <CardDescription>Manage and monitor your TeamServer instance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={isRunning ? "default" : "destructive"} className="text-lg py-1 px-3">
                {isRunning ? "Running" : "Stopped"}
              </Badge>
              {isRunning && (
                <div className="text-sm text-gray-500">
                  Uptime: {formatUptime(uptime)}
                </div>
              )}
            </div>
            {isRunning && (
              <div className="flex gap-4 text-sm">
                <div>Connected Clients: {connectedClients.size}</div>
                <div>Active Port: {serverConfig.port}</div>
                <div>Mode: {secureMode ? 'WSS' : 'WS'}</div>
              </div>
            )}
          </div>

          <Tabs defaultValue="server-settings">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="server-settings">Server Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="server-settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ip-binding">IP Binding</Label>
                  <Select
                    value={serverConfig.ipBinding}
                    onValueChange={(value) => handleConfigChange('ipBinding', value)}
                  >
                    <SelectTrigger id="ip-binding">
                      <SelectValue placeholder="Select IP binding" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.0.0.0">0.0.0.0 (All Interfaces)</SelectItem>
                      <SelectItem value="127.0.0.1">127.0.0.1 (Localhost)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={serverConfig.port}
                    onChange={(e) => handleConfigChange('port', e.target.value)}
                    placeholder="6000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={serverConfig.password}
                    onChange={(e) => handleConfigChange('password', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={serverConfig.password}
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={generateSecurePassword}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate secure password</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="secure-mode"
                  checked={secureMode}
                  onCheckedChange={setSecureMode}
                />
                <Label htmlFor="secure-mode">Enable WSS (HTTPS) mode</Label>
              </div>
              {!secureMode && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Insecure mode (WS) is enabled. It's recommended to use WSS for production environments.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost">Advanced Options</Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="ssl-cert">SSL Certificate (for WSS)</Label>
                <Input id="ssl-cert" type="file" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssl-key">SSL Key (for WSS)</Label>
                <Input id="ssl-key" type="file" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Connection Timeout (seconds)</Label>
                <Input id="timeout" type="number" placeholder="30" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={handleStartStop}
            className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isRunning ? "Stop Server" : "Start Server"}
          </Button>
        </CardFooter>
      </Card>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <code className="bg-gray-100 p-2 rounded">
                ws{secureMode ? 's' : ''}://{serverConfig.ipBinding}:{serverConfig.port}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(`ws${secureMode ? 's' : ''}://${serverConfig.ipBinding}:${serverConfig.port}`)
                  toast.success("Connection string copied to clipboard")
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm">
              Quick connect command:
              <code className="bg-gray-100 p-1 ml-2 rounded">
                teamserver connect ws{secureMode ? 's' : ''}://{serverConfig.ipBinding}:{serverConfig.port}
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      {isRunning && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Server Logs</CardTitle>
            <div className="flex items-center space-x-2">
              <Select
                value={logLevel || 'ALL'}
                onValueChange={(value) => setLogLevel(value === 'ALL' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARNING">WARNING</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  setLogs([])
                  try {
                    const response = await apiClient.get("/st_teamserver/logs/", { params: { limit: 100, level: logLevel || undefined } })
                    if (response.status === 200) {
                      setLogs(response.data)
                      toast.success("Logs refreshed.")
                    }
                  } catch (error: any) {
                    console.error(error)
                    if (error.response) {
                      if (error.response.status === 500) {
                        toast.error("Failed to refresh logs: Log file not found.")
                      } else {
                        toast.error(error.response.data.detail || "Failed to refresh logs.")
                      }
                    } else {
                      toast.error("Network error: Unable to reach the server.")
                    }
                  }
                }}
                disabled={isFetchingLogs}
              >
                <RefreshCw className={`h-4 w-4 ${isFetchingLogs ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={index} className="text-sm">
                      <TableCell>{log.time}</TableCell>
                      <TableCell>
                        <Badge variant={
                          log.level === 'ERROR' ? 'destructive' :
                          log.level === 'WARNING' ? 'secondary' :
                          log.level === 'INFO' ? 'default' :
                          'outline'
                        }>
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>{log.filename}:{log.lineno} ({log.funcName})</TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && !isFetchingLogs && (
                <div className="text-center text-gray-500">
                  No logs available.
                </div>
              )}
              {isFetchingLogs && (
                <div className="text-center text-gray-500">
                  Loading logs...
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
