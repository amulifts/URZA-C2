// URZA-C2/next-urza-frontend/frontend/src/components/urza/agents/agents-content.tsx

"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"
import { toast } from "react-toastify"

interface LogEntry {
  time: string
  level: string
  message: string
  // plus any other fields from your logs if needed
}

interface AgentSession {
  guid: string        // e.g. "bee879c8-a495-49d3-9003-7e51a4a2b7f4"
  // hostname: string    // e.g. "name"
  address: string    // e.g. "10.211.55.16"
  alias: string       // optional alias from "Registering session"
  lastCheckIn: string // from log time
  status: string      // "Active" or something else
}

export function AgentsContent() {
  const [sessions, setSessions] = useState<AgentSession[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(sessions.length / itemsPerPage)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sessions.slice(startIndex, startIndex + itemsPerPage)
  }

  // Helper to parse sessions from logs
  const extractSessionsFromLogs = (logs: LogEntry[]): AgentSession[] => {
    const sessionMap: Record<string, AgentSession> = {}
  
    const registerRegex = /Registering session:\s*<Session\s+([\w-]+).*alias:\s*([^>]+)>/i
    const newSessionRegex = /New session\s+([\w-]+)\s+connected!\s*\(([\d.]+)\)/i
  
    for (const entry of logs) {
      const { message, time } = entry
  
      // Check for register line
      const regMatch = message.match(registerRegex)
      if (regMatch) {
        const [_, guid, alias] = regMatch
        if (!sessionMap[guid]) {
          sessionMap[guid] = {
            guid,
            address: "",
            alias,
            lastCheckIn: time,
            status: "Inactive", // Default to Inactive
          }
        } else {
          sessionMap[guid].alias = alias
          sessionMap[guid].lastCheckIn = time
          sessionMap[guid].status = sessionMap[guid].address
            ? "Active"
            : "Inactive" // Update based on address
        }
      }
  
      // Check for new session line
      const newMatch = message.match(newSessionRegex)
      if (newMatch) {
        const [_, guid, ip] = newMatch
        if (!sessionMap[guid]) {
          sessionMap[guid] = {
            guid,
            address: ip,
            alias: "",
            lastCheckIn: time,
            status: ip ? "Active" : "Inactive", // Active if address is present
          }
        } else {
          sessionMap[guid].address = ip
          sessionMap[guid].status = ip ? "Active" : "Inactive" // Update based on address
          sessionMap[guid].lastCheckIn = time
        }
      }
    }
  
    return Object.values(sessionMap)
  }
  

  const fetchLogs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get("/st_teamserver/logs/", {
        params: { limit: 200 },
      })
      if (response.status === 200) {
        const logs: LogEntry[] = response.data
        const extracted = extractSessionsFromLogs(logs)
        setSessions(extracted)
      } else {
        toast.error("Failed to load sessions.")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || "An error occurred while fetching sessions.")
      toast.error(err.response?.data?.detail || "Failed to fetch sessions.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // Optionally poll
    // const interval = setInterval(fetchLogs, 10000)
    // return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GUID</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Alias</TableHead>
              <TableHead>Last CheckIn</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : getCurrentPageData().length > 0 ? (
              getCurrentPageData().map((agent, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{agent.guid}</TableCell>
                  <TableCell>{agent.address}</TableCell>
                  <TableCell>{agent.alias}</TableCell>
                  <TableCell>{agent.lastCheckIn}</TableCell>
                  <TableCell>
                    <Badge
                      variant={agent.status === "Active" ? "default" : "destructive"}
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No sessions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage(prev => Math.max(prev - 1, 1))
                }}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage(i + 1)
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
                  e.preventDefault()
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
