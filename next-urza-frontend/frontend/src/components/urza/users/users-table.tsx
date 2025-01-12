// next-urza-frontend\frontend\src\components\urza\users\users-table.tsx

"use client"

import { useState, useEffect } from "react"
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
import { CreateUserDialog } from "./create-user-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"

interface User {
  id: number; // now a UUID string instead of number
  username: string;
  full_name: string | null;
  role: string;
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [refreshToggle, setRefreshToggle] = useState(false) // used to trigger refresh from dialog
  const itemsPerPage = 5
  const totalPages = Math.ceil(users.length / itemsPerPage)

  // Fetch users from the django endpoint (/users/list)
  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users/list")
      setUsers(res.data)
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError("Failed to fetch users from server.")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [refreshToggle])

  // When a user is created successfully, toggle refresh so that fetchUsers gets called
  const handleUserCreated = () => {
    setRefreshToggle(prev => !prev)
  }

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return users.slice(startIndex, startIndex + itemsPerPage)
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="bg-red-100 border-red-500 text-red-700">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageData().map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>
                  <Link 
                    href={`/users/${user.username}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {user.username}
                  </Link>
                </TableCell>
                <TableCell>{user.full_name || "-"}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center">
        
      <div className="flex justify-end">
        <CreateUserDialog onUserCreated={handleUserCreated} />
      </div>
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
