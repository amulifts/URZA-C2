// URZA-C2/next-urza-frontend/frontend/src/components/urza/dashboard/listeners-table.tsx

"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { toast } from "react-toastify"
import Link from "next/link"

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

interface Listener {
  name: string       // e.g. "http-80"
  listenerType: string
  host: string
  port: number
  startTime: string
  status: string
}

export function ListenersTable() {
  const [listeners, setListeners] = useState<Listener[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.ceil(listeners.length / itemsPerPage)

  // Parse out lines like: "Started http listener (10.211.55.17:80)"
  const parseListenersFromLogs = (logs: any[]) => {
    const resultMap: Record<string, Listener> = {}
    const startRegex = /^Started\s+(\w+)\s+listener\s+\(([\d.]+):(\d+)\)$/i
    // If you have "Stopped X listener" lines, you can parse them similarly

    logs.forEach((log) => {
      const { message, time } = log
      const match = message.match(startRegex)
      if (match) {
        const [_, type, host, portStr] = match
        const port = parseInt(portStr, 10)
        const name = `${type}-${port}`
        resultMap[name] = {
          name,
          listenerType: type,
          host,
          port,
          startTime: time,
          status: "Active",
        }
      }
      // If you have "Stopped ...", update status to "Inactive"
    })

    return Object.values(resultMap)
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get("/st_teamserver/logs/", { params: { limit: 200 } })
      if (res.status === 200) {
        const parsed = parseListenersFromLogs(res.data)
        setListeners(parsed)
      } else {
        toast.error("Failed to load listeners.")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || "An error occurred while fetching listeners.")
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
    return listeners.slice(startIndex, startIndex + itemsPerPage)
  }

  if (loading) {
    return <div>Loading listeners...</div>
  }
  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Listeners</h2>
      </div>
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
            {loading ? (
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
