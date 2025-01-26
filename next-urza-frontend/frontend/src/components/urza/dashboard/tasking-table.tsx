// URZA-C2/next-urza-frontend/frontend/src/components/urza/dashboard/tasking-table.tsx

"use client"

import { useState } from "react"
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
  { name: "Task-1", agent: "Agent-1", task: "Execute", status: "Completed", userName: "admin", command: "whoami", commandTime: "2024-01-20 10:00", completionTime: "2024-01-20 10:01" },
  { name: "Task-2", agent: "Agent-2", task: "Upload", status: "In Progress", userName: "user1", command: "upload file.txt", commandTime: "2024-01-20 11:00", completionTime: "-" },
  { name: "Task-3", agent: "Agent-1", task: "Download", status: "Completed", userName: "admin", command: "download data.zip", commandTime: "2024-01-20 12:00", completionTime: "2024-01-20 12:05" },
  { name: "Task-4", agent: "Agent-3", task: "Execute", status: "Failed", userName: "user2", command: "netstat", commandTime: "2024-01-20 13:00", completionTime: "2024-01-20 13:01" },
  { name: "Task-5", agent: "Agent-2", task: "Persistence", status: "Completed", userName: "admin", command: "install backdoor", commandTime: "2024-01-20 14:00", completionTime: "2024-01-20 14:10" },
]

export function TaskingsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 2
  const totalPages = Math.ceil(taskingsData.length / itemsPerPage)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return taskingsData.slice(startIndex, startIndex + itemsPerPage)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Taskings</h2>
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
                <TableCell className="font-medium">{tasking.name}</TableCell>
                <TableCell>{tasking.agent}</TableCell>
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

