// next-urza-frontend/frontend/src/components/urza/teamserver-client/teamserver-list.tsx

"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, Star, Copy, Trash2, LinkIcon, Plus } from 'lucide-react';
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api";

interface TeamServer {
  name: string;
  host: string;
  port: number;
  protocol: string;
  is_favorite: boolean;
  status: string;
  last_seen: string | null;
}

interface LogEntry {
  time: string;
  level: string;
  message: string;
  name: string;
  filename: string;
  lineno: number;
  funcName: string;
}

export function TeamServerList() {
  const [teamServers, setTeamServers] = useState<TeamServer[]>([
    { name: 'TeamServer1', host: '0.0.0.0', port: 6000, protocol: 'WS', is_favorite: false, status: 'offline', last_seen: null },
    { name: 'TeamServer2', host: '0.0.0.0', port: 6001, protocol: 'WS', is_favorite: false, status: 'offline', last_seen: null },
    { name: 'TeamServer3', host: '0.0.0.0', port: 6002, protocol: 'WS', is_favorite: false, status: 'offline', last_seen: null },
    { name: 'TeamServer4', host: '0.0.0.0', port: 6003, protocol: 'WSS', is_favorite: false, status: 'offline', last_seen: null },
    { name: 'TeamServer5', host: '0.0.0.0', port: 6004, protocol: 'WS', is_favorite: false, status: 'offline', last_seen: null },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchLogs = async () => {
    try {
      const response = await apiClient.get("/st_teamserver/logs/", { params: { limit: 100 } });
      if (response.status === 200) {
        const logs: LogEntry[] = response.data;
        updateTeamServerStatuses(logs);
      } else {
        toast.error("Failed to fetch logs.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while fetching logs.");
    }
  };

  const updateTeamServerStatuses = (logs: LogEntry[]) => {
    const updatedServers = teamServers.map(server => {
      let status: 'online' | 'offline' | 'unstable' = 'offline';
      let lastSeen: string | null = server.last_seen;

      logs.forEach(log => {
        const message_clean = log.message.replace(/\x1B[@-_][0-?]*[ -/]*[@-~]/g, ''); 
        const startMatch = message_clean.match(new RegExp(`^Teamserver started on\\s+${escapeRegExp(server.host)}:${server.port}$`, 'i'));
        if (startMatch) {
          status = 'online';
          lastSeen = log.time;
        }
        const stopMatch = message_clean.match(new RegExp(`^Teamserver stopped on\\s+${escapeRegExp(server.host)}:${server.port}$`, 'i'));
        if (stopMatch) {
          status = 'offline';
          lastSeen = log.time;
        }
      });

      return { ...server, status, last_seen: lastSeen };
    });
    setTeamServers(updatedServers);
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  useEffect(() => {
    fetchLogs();
    const logInterval = setInterval(fetchLogs, 5000);
    return () => clearInterval(logInterval);
  }, []);

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleConnect = (server: TeamServer) => {
    toast.info("Feature not implemented yet.");
  };

  const handleToggleFavorite = async (server: TeamServer) => {
    try {
      const updatedServers = teamServers.map(s =>
        s.name === server.name ? { ...s, is_favorite: !s.is_favorite } : s
      );
      setTeamServers(updatedServers);
      toast.success(`TeamServer '${server.name}' favorite status updated.`);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update favorite status.");
    }
  };

  const handleCopyDetails = (server: TeamServer) => {
    const connectionString = `${server.protocol.toLowerCase()}://${server.host}:${server.port}`;
    navigator.clipboard.writeText(connectionString);
    toast.success("Connection details copied to clipboard.");
  };

  const handleRemove = (serverName: string) => {
    const updatedServers = teamServers.filter(s => s.name !== serverName);
    setTeamServers(updatedServers);
    toast.success("TeamServer removed successfully.");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Available TeamServers</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="default" size="icon" onClick={() => window.open('/teamserver', '_blank')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
            {teamServers.map((server, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Badge variant={
                    server.status === 'online' ? 'default' :
                    server.status === 'offline' ? 'destructive' :
                    'secondary'
                  }>
                    {server.status}
                  </Badge>
                </TableCell>
                <TableCell>{server.name}</TableCell>
                <TableCell>{server.host}</TableCell>
                <TableCell>{server.port}</TableCell>
                <TableCell>{server.protocol}</TableCell>
                <TableCell>{server.last_seen || 'N/A'}</TableCell>
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
                          <Button variant="outline" size="icon" onClick={() => handleToggleFavorite(server)}>
                            <Star className={`h-4 w-4 ${server.is_favorite ? 'fill-yellow-400' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{server.is_favorite ? 'Remove from favorites' : 'Add to favorites'}</p>
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
                          <Button variant="outline" size="icon" onClick={() => handleRemove(server.name)}>
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
        {teamServers.length === 0 && !isRefreshing && (
          <div className="text-center text-gray-500 mt-4">
            No TeamServers available. Please start or add a TeamServer.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
