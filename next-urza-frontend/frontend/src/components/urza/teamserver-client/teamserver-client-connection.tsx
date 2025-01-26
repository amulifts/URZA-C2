// URZA-C2/next-urza-frontend/frontend/src/components/urza/teamserver-client/teamserver-client-connection.tsx

"use client"

import { useState } from 'react'
import { useTeamServerConnection } from "@/context/TeamServerConnectionContext";
import { Eye, EyeOff, Copy } from 'lucide-react'
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
import { toast } from "react-toastify";

export function TeamServerClientConnection() {
  const { isConnected, connectedConfig, connect, disconnect } = useTeamServerConnection();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(false);
  
  // Local state for form inputs
  const [formConfig, setFormConfig] = useState({
    protocol: 'ws',
    host: 'localhost',
    port: '6000',
    username: 'admin',
    password: '',
  });

  // Handle input changes
  const handleConfigChange = (key: keyof typeof formConfig, value: string) => {
    setFormConfig(prevConfig => ({ ...prevConfig, [key]: value }));
  };

  // Handle form submission
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const { protocol, host, port, username, password } = formConfig;

    // Basic frontend validation
    if (!protocol || !host || !port || !username || !password) {
      toast.error("All fields are required.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Initiate connection using shared context
    await connect(formConfig);
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTestConnection = () => {
    toast.info("Testing Connection: Attempting to test TeamServer connection...");
    // Implement actual test logic here or call a test endpoint
  };

  const handleSaveConfiguration = () => {
    toast.success("Configuration Saved: TeamServer client configuration has been saved.");
    // Persist config if desired
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">TeamServer Client Connection</CardTitle>
          <CardDescription>Manage your connection to the TeamServer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? "default" : "destructive"} className="text-lg py-1 px-3">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              {isConnected && connectedConfig && (
                <div className="text-sm text-gray-500">
                  Uptime: {connectedConfig ? "N/A" : "0:00:00"} {/* Placeholder, replace with actual uptime */}
                </div>
              )}
            </div>
            {isConnected && (
              <Button variant="outline" onClick={disconnect}>
                Disconnect
              </Button>
            )}
          </div>

          {/* Server Details Form */}
          <form onSubmit={handleConnect} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Server Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Protocol</Label>
                  <RadioGroup
                    value={formConfig.protocol}
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
                {formConfig.protocol === 'ws' && (
                  <Alert variant="destructive">
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
                      value={formConfig.host}
                      onChange={(e) => handleConfigChange('host', e.target.value)}
                      placeholder="localhost"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      value={formConfig.port}
                      onChange={(e) => handleConfigChange('port', e.target.value)}
                      placeholder="6000"
                      required
                      type="number"
                      min="1"
                      max="65535"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formConfig.username}
                    onChange={(e) => handleConfigChange('username', e.target.value)}
                    placeholder="admin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formConfig.password}
                      onChange={(e) => handleConfigChange('password', e.target.value)}
                      className="flex-grow"
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
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

            {/* Connect Button */}
            <Button type="submit" className="w-full">
              Connect
            </Button>
          </form>

          {/* Connection Information */}
          {isConnected && connectedConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Connection Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Connected Server:</strong> {connectedConfig.host}:{connectedConfig.port}
                </div>
                <div>
                  <strong>Protocol:</strong> {connectedConfig.protocol.toUpperCase()}
                </div>
                <div>
                  <strong>Connection String:</strong>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 p-1 rounded">
                      {`${connectedConfig.protocol}://${connectedConfig.host}:${connectedConfig.port}`}
                    </code>
                    <Button variant="outline" size="icon" onClick={() => {
                      navigator.clipboard.writeText(`${connectedConfig.protocol}://${connectedConfig.host}:${connectedConfig.port}`)
                      toast.success("Connection string copied to clipboard");
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
