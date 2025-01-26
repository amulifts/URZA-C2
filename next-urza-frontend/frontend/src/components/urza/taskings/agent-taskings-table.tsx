// URZA-C2/next-urza-frontend/frontend/src/components/urza/taskings/agent-taskings-table.tsx

"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
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

const taskingsData = [
  {
    name: "ee2268d505",
    agent: "4e08e14e3f",
    task: "ScreenShot",
    status: "Uninitialized",
    userName: "admin",
    command: "ScreenShot",
    commandTime: "12/27/2024 6:47:26 PM",
    completionTime: "1/1/0001 12:00:00 AM"
  },
  {
    name: "59aad5fd15",
    agent: "4e08e14e3f",
    task: "WhoAmI",
    status: "Uninitialized",
    userName: "admin",
    command: "WhoAmI",
    commandTime: "12/27/2024 6:49:38 PM",
    completionTime: "1/1/0001 12:00:00 AM"
  },
  {
    name: "7b3c9d2e8f",
    agent: "4e08e14e3f",
    task: "ProcessList",
    status: "Uninitialized",
    userName: "admin",
    command: "ps",
    commandTime: "12/27/2024 6:51:12 PM",
    completionTime: "1/1/0001 12:00:00 AM"
  },
  {
    name: "a1d4f7e2b9",
    agent: "4e08e14e3f",
    task: "NetworkConnections",
    status: "Uninitialized",
    userName: "admin",
    command: "netstat",
    commandTime: "12/27/2024 6:53:45 PM",
    completionTime: "1/1/0001 12:00:00 AM"
  },
  {
    name: "c5e8b2a9f4",
    agent: "4e08e14e3f",
    task: "SystemInfo",
    status: "Uninitialized",
    userName: "admin",
    command: "systeminfo",
    commandTime: "12/27/2024 6:55:20 PM",
    completionTime: "1/1/0001 12:00:00 AM"
  }
]

export function AgentTaskingsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 5

  const filteredData = taskingsData.filter(tasking =>
    Object.values(tasking).some(value => 
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Input
          placeholder="Search..."
          className="w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>UserName</TableHead>
              <TableHead>Command</TableHead>
              <TableHead>CommandTime</TableHead>
              <TableHead>CompletionTime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageData().map((tasking, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Link 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {tasking.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {tasking.agent}
                  </Link>
                </TableCell>
                <TableCell>{tasking.task}</TableCell>
                <TableCell>{tasking.status}</TableCell>
                <TableCell>{tasking.userName}</TableCell>
                <TableCell>{tasking.command}</TableCell>
                <TableCell>{tasking.commandTime}</TableCell>
                <TableCell>{tasking.completionTime}</TableCell>
              </TableRow>
            ))}
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

