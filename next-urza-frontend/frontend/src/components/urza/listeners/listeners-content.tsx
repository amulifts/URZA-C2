// next-urza-frontend\frontend\src\components\urza\listeners\listeners-content.tsx

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, LinkIcon, Star, Copy, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api";

interface LogEntry {
  time: string;
  level: string;
  message: string;
  name: string;
  filename: string;
  lineno: number;
  funcName: string;
}

interface Listener {
  name: string;
  listenerType: string;
  host: string;
  port: number;
  status: string; // 'Active' or 'Inactive'
  startTime: string;
}

export function ListenersContent() {
  const router = useRouter();

  const [listeners, setListeners] = useState<Listener[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalPages = Math.ceil(listeners.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return listeners.slice(startIndex, startIndex + itemsPerPage);
  };

  /**
   * Fetch logs and update listeners. 
   * @param showToast - if true, show "Listeners loaded successfully" toast
   */
  const fetchLogs = async (showToast = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/st_teamserver/logs/", {
        params: { limit: 100 }, // Adjust limit as needed
      });
      if (response.status === 200) {
        const logs: LogEntry[] = response.data;
        const extractedListeners = extractListenersFromLogs(logs);
        setListeners(extractedListeners);

        // Only show success toast when "showToast" is true
        if (showToast) {
          toast.success("Listeners loaded successfully.", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      } else {
        toast.error("Failed to load listeners.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || "An error occurred while fetching listeners."
      );
      toast.error(
        err.response?.data?.detail || "Failed to fetch listeners.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to extract listeners from logs
  const extractListenersFromLogs = (logs: LogEntry[]): Listener[] => {
    const listenersMap: { [key: string]: Listener } = {};

    const listenerStartPattern = /Started (\w+) listener \(([\d.]+):(\d+)\)/i;
    const listenerStopPattern = /TeamServer stopped on\s+([\d.]+):(\d+)/i;

    // Iterate over logs in reverse to get the latest status
    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      const message = log.message;

      // Check for listener start
      const startMatch = message.match(listenerStartPattern);
      if (startMatch) {
        const [, type, host, portStr] = startMatch;
        const port = parseInt(portStr, 10);
        const name = `${type}-${port}`;
        if (!listenersMap[name]) {
          listenersMap[name] = {
            name,
            listenerType: type,
            host,
            port,
            status: "Active",
            startTime: log.time,
          };
        }
        continue;
      }

      // Check for listener stop
      const stopMatch = message.match(listenerStopPattern);
      if (stopMatch) {
        const [, host, portStr] = stopMatch;
        const port = parseInt(portStr, 10);
        // Attempt to find the listener by matching host and port
        const listener = Object.values(listenersMap).find(
          (lst) => lst.host === host && lst.port === port
        );
        if (listener) {
          listener.status = "Inactive";
          listener.startTime = log.time;
        }
        continue;
      }
    }

    return Object.values(listenersMap);
  };

  // On component mount, start polling every 10 seconds, but do NOT show success toast automatically
  useEffect(() => {
    fetchLogs(); // no toast on initial load
    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchLogs().finally(() => setIsRefreshing(false));
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Pass true here to show the success toast
    fetchLogs(true).finally(() => setIsRefreshing(false));
  };

  const handleConnect = (listener: Listener) => {
    // toast saying feature not implemented
    toast.info("Feature not implemented yet.", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleToggleFavorite = (listener: Listener) => {
    // // Implement the toggle favorite logic here
    // toast.info("Feature not implemented yet.", {
    //   position: "top-right",
    //   autoClose: 2000,
    // });

    // allow toggling favorite status
    const updatedListeners = listeners.map((lst) => {
      if (lst.name === listener.name) {
        return {
          ...lst,
          status: lst.status === "Active" ? "Inactive" : "Active",
        };
      }
      return lst;
    });

    setListeners(updatedListeners);

  };

  const handleCopyDetails = (listener: Listener) => {
    const connectionString = `${listener.listenerType.toLowerCase()}://${listener.host}:${listener.port}`;
    navigator.clipboard.writeText(connectionString);
    toast.success("Connection details copied to clipboard.", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleRemove = (listenerName: string) => {
    // Implement the remove logic here
    toast.info("Feature not implemented yet.", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Listener Type</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Port</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading listeners...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : getCurrentPageData().length > 0 ? (
              getCurrentPageData().map((listener, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge
                      variant={
                        listener.status === "Active" ? "default" : "destructive"
                      }
                    >
                      {listener.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/listeners/${listener.name}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {listener.name}
                    </Link>
                  </TableCell>
                  <TableCell>{listener.listenerType}</TableCell>
                  <TableCell>{listener.host}</TableCell>
                  <TableCell>{listener.port}</TableCell>
                  <TableCell>{listener.startTime}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleConnect(listener)}
                            >
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
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleFavorite(listener)}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  listener.status === "Active"
                                    ? "fill-yellow-400"
                                    : ""
                                }`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {listener.status === "Active"
                                ? "Remove from favorites"
                                : "Add to favorites"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopyDetails(listener)}
                            >
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
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemove(listener.name)}
                            >
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No listeners available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {/* Create Listener Button */}
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            onClick={() => router.push("/listeners/create")}
          >
            <Plus className="h-4 w-4" />
            Create Listener
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                }}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
