// next-urza-frontend\frontend\src\components\urza\teamserver-client\teamserver-list.tsx

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RefreshCw, Star, Copy, Trash2, LinkIcon } from 'lucide-react'

interface TeamServer {
  id: string
  name: string
  status: 'online' | 'offline' | 'unstable'
  host: string
  port: number
  protocol: 'WS' | 'WSS'
  lastSeen: string
  isFavorite: boolean
}

const mockTeamServers: TeamServer[] = [
  { id: '1', name: 'Production Server', status: 'online', host: '192.168.1.100', port: 6000, protocol: 'WSS', lastSeen: '2023-06-15 10:30:00', isFavorite: true },
  { id: '2', name: 'Development Server', status: 'offline', host: '10.0.0.5', port: 6000, protocol: 'WS', lastSeen: '2023-06-14 15:45:00', isFavorite: false },
  { id: '3', name: 'Testing Server', status: 'unstable', host: '172.16.0.10', port: 6001, protocol: 'WSS', lastSeen: '2023-06-15 09:15:00', isFavorite: true },
]

export function TeamServerList() {
  const [teamServers, setTeamServers] = useState<TeamServer[]>(mockTeamServers)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulating API call
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleConnect = (server: TeamServer) => {
    router.push(`/teamserver-client/connect?host=${server.host}&port=${server.port}&protocol=${server.protocol}`)
  }

  const handleToggleFavorite = (id: string) => {
    setTeamServers(prev => prev.map(server => 
      server.id === id ? { ...server, isFavorite: !server.isFavorite } : server
    ))
  }

  const handleCopyDetails = (server: TeamServer) => {
    navigator.clipboard.writeText(`${server.protocol.toLowerCase()}://${server.host}:${server.port}`)
  }

  const handleRemove = (id: string) => {
    setTeamServers(prev => prev.filter(server => server.id !== id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Available TeamServers</CardTitle>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Port</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamServers.map((server) => (
              <TableRow key={server.id}>
                <TableCell>
                  <Badge variant={server.status === 'online' ? 'default' : server.status === 'offline' ? 'destructive' : 'secondary'}>
                    {server.status}
                  </Badge>
                </TableCell>
                <TableCell>{server.name}</TableCell>
                <TableCell>{server.host}</TableCell>
                <TableCell>{server.port}</TableCell>
                <TableCell>{server.protocol}</TableCell>
                <TableCell>{server.lastSeen}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleConnect(server)}>
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Connect</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleToggleFavorite(server.id)}>
                            <Star className={`h-4 w-4 ${server.isFavorite ? 'fill-yellow-400' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{server.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleCopyDetails(server)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy connection details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleRemove(server.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove from list</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

