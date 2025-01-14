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
import {apiClient} from "@/lib/api";
import Modal from "@/components/ui/modal"; // Ensure this component exists
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamServer {
  id: number;
  name: string;
  status: 'online' | 'offline' | 'unstable';
  host: string;
  port: number;
  protocol: 'WS' | 'WSS';
  last_seen: string;
  is_favorite: boolean;
}

export function TeamServerList() {
  const [teamServers, setTeamServers] = useState<TeamServer[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServer, setNewServer] = useState({
    host: '',
    password: '',
    port: '',
    secure: false,
    is_favorite: false,
  });
  const router = useRouter();

  const fetchTeamServers = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiClient.get("/st_teamserver/list/");
      if (response.status === 200) {
        setTeamServers(response.data);
      } else {
        toast.error("Failed to fetch TeamServers.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while fetching TeamServers.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeamServers();
  }, []);

  const handleRefresh = () => {
    fetchTeamServers();
  };

  const handleConnect = (server: TeamServer) => {
    // Navigate to the connection page with query parameters
    router.push(`/teamserver-client/connect?host=${server.host}&port=${server.port}&protocol=${server.protocol}`);
  };

  const handleToggleFavorite = async (server: TeamServer) => {
    try {
      const response = await apiClient.patch(`/st_teamserver/update/${server.id}/`, {
        is_favorite: !server.is_favorite,
      });
      if (response.status === 200) {
        setTeamServers(prev => prev.map(s => s.id === server.id ? { ...s, is_favorite: response.data.is_favorite } : s));
        toast.success(`TeamServer '${server.name}' updated successfully.`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Failed to update TeamServer.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while updating TeamServer.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCopyDetails = (server: TeamServer) => {
    const connectionString = `${server.protocol.toLowerCase()}://${server.host}:${server.port}`;
    navigator.clipboard.writeText(connectionString);
    toast.success("Connection details copied to clipboard.", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleRemove = async (serverId: number) => {
    if (!confirm("Are you sure you want to remove this TeamServer?")) return;
    try {
      const response = await apiClient.delete(`/st_teamserver/delete/${serverId}/`);
      if (response.status === 200) {
        setTeamServers(prev => prev.filter(s => s.id !== serverId));
        toast.success("TeamServer removed successfully.", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Failed to remove TeamServer.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while removing TeamServer.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewServer(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleStartTeamServer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { host, password, port, secure, is_favorite } = newServer;

    // Basic validation
    if (!host || !password || !port) {
      toast.error("Please fill in all required fields.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await apiClient.post("/st_teamserver/start/", {
        host,
        password,
        port: parseInt(port, 10),
        secure,
        is_favorite,
      });

      if (response.status === 200) {
        toast.success("TeamServer started successfully.", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsModalOpen(false);
        setNewServer({
          host: '',
          password: '',
          port: '',
          secure: false,
          is_favorite: false,
        });
        fetchTeamServers();
      } else {
        toast.error("Failed to start TeamServer.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.data) {
        const detail = error.response.data.detail;
        toast.error(`Error: ${detail}`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("An error occurred while starting TeamServer.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Available TeamServers</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="default" size="icon" onClick={() => setIsModalOpen(true)}>
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
                <TableCell>{new Date(server.last_seen).toLocaleString()}</TableCell>
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
        {teamServers.length === 0 && !isRefreshing && (
          <div className="text-center text-gray-500 mt-4">
            No TeamServers available. Please start or add a TeamServer.
          </div>
        )}
      </CardContent>

      {/* Modal for Adding a New TeamServer */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Add New TeamServer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartTeamServer} className="space-y-4">
              {/* Since 'name' is removed, no input for 'name' */}
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  name="host"
                  value={newServer.host}
                  onChange={handleInputChange}
                  placeholder="Enter host or IP"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newServer.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  name="port"
                  type="number"
                  value={newServer.port}
                  onChange={handleInputChange}
                  placeholder="Enter port"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="secure"
                  name="secure"
                  checked={newServer.secure}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="secure">Secure (WSS)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_favorite"
                  name="is_favorite"
                  checked={newServer.is_favorite}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                />
                <Label htmlFor="is_favorite">Mark as Favorite</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="w-full">Start TeamServer</Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Modal>
    </Card>
  );
}
