// next-urza-frontend\frontend\src\components\urza\launcher\launcher-form.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download, Zap } from 'lucide-react'

export function LauncherForm() {
  const [formData, setFormData] = useState({
    listener: "",
    implantTemplate: "",
    dotNetVersion: "",
    delay: "5",
    jitterPercent: "10",
    connectAttempts: "5000",
    killDate: new Date().toISOString().split('T')[0],
    output: ""
  })

  const handleGenerate = () => {
    // Add your generation logic here
    setFormData(prev => ({
      ...prev,
      output: "Generated launcher code will appear here..."
    }))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.output)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listener">Listener</Label>
                <Select
                  value={formData.listener}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, listener: value }))}
                >
                  <SelectTrigger id="listener">
                    <SelectValue placeholder="Select listener" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP Listener</SelectItem>
                    <SelectItem value="https">HTTPS Listener</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="implantTemplate">ImplantTemplate</Label>
                <Select
                  value={formData.implantTemplate}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, implantTemplate: value }))}
                >
                  <SelectTrigger id="implantTemplate">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Template</SelectItem>
                    <SelectItem value="custom">Custom Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dotNetVersion">DotNetVersion</Label>
                <Select
                  value={formData.dotNetVersion}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dotNetVersion: value }))}
                >
                  <SelectTrigger id="dotNetVersion">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="net35">NET 3.5</SelectItem>
                    <SelectItem value="net40">NET 4.0</SelectItem>
                    <SelectItem value="net45">NET 4.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delay">Delay</Label>
                <Input
                  id="delay"
                  type="number"
                  value={formData.delay}
                  onChange={(e) => setFormData(prev => ({ ...prev, delay: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jitterPercent">JitterPercent</Label>
                <Input
                  id="jitterPercent"
                  type="number"
                  value={formData.jitterPercent}
                  onChange={(e) => setFormData(prev => ({ ...prev, jitterPercent: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connectAttempts">ConnectAttempts</Label>
                <Input
                  id="connectAttempts"
                  type="number"
                  value={formData.connectAttempts}
                  onChange={(e) => setFormData(prev => ({ ...prev, connectAttempts: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="killDate">KillDate</Label>
              <Input
                id="killDate"
                type="date"
                value={formData.killDate}
                onChange={(e) => setFormData(prev => ({ ...prev, killDate: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Launcher</Label>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={formData.output}
              readOnly
              className="font-mono h-[200px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

