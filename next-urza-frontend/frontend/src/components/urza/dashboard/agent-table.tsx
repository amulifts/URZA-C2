// URZA-C2/next-urza-frontend/frontend/src/components/urza/dashboard/agent-table.tsx

"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { toast } from "react-toastify"

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

// Example shape for an agent (session)
interface AgentSession {
  guid: string
  // hostname: string
  address: string
  alias: string
  lastCheckIn: string
  status: string
}

export function AgentsTable() {
  const [sessions, setSessions] = useState<AgentSession[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.ceil(sessions.length / itemsPerPage)

  // Simple parse logic from logs (adapt to your actual approach)
  const parseSessionsFromLogs = (logs: any[]) => {
    // You can reuse the same regex from your existing AgentsContent
    const sessionMap: Record<string, AgentSession> = {}

    const regRegex = /Registering session:\s*<Session\s+([\w-]+).*alias:\s*([^>]+)>/i
    const newRegex = /New session\s+([\w-]+)\s+connected!\s*\(([\d.]+)\)/i

    logs.forEach((log) => {
      const { message, time } = log
      const registerMatch = message.match(regRegex)
      if (registerMatch) {
        const [_, guid, alias] = registerMatch
        if (!sessionMap[guid]) {
          sessionMap[guid] = {
            guid,
            alias,
            address: "",
            lastCheckIn: time,
            status: "Active",
          }
        } else {
          sessionMap[guid].alias = alias
          sessionMap[guid].lastCheckIn = time
        }
      }

      const newSessionMatch = message.match(newRegex)
      if (newSessionMatch) {
        const [_, guid, host] = newSessionMatch
        if (!sessionMap[guid]) {
          sessionMap[guid] = {
            guid,
            alias: "",
            address: host,
            lastCheckIn: time,
            status: "Active",
          }
        } else {
          sessionMap[guid].address = host
          sessionMap[guid].status = "Active"
          sessionMap[guid].lastCheckIn = time
        }
      }
    })

    return Object.values(sessionMap)
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // e.g. get logs from the same endpoint
      const res = await apiClient.get("/st_teamserver/logs/", { params: { limit: 200 } })
      if (res.status === 200) {
        const sessionsParsed = parseSessionsFromLogs(res.data)
        setSessions(sessionsParsed)
      } else {
        toast.error("Failed to load agents (sessions).")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || "An error occurred while fetching sessions.")
      toast.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sessions.slice(startIndex, startIndex + itemsPerPage)
  }

  if (loading) {
    return <div>Loading agents...</div>
  }
  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Agents</h2>
      </div>
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
            {loading ? (
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
      {/* Pagination */}
      <div className="flex justify-end">
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
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
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
