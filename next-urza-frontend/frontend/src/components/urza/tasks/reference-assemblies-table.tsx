"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from 'lucide-react'
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

const assembliesData = [
  { name: "System.Drawing.dll", dotNetVersion: "Net35" },
  { name: "System.Core.dll", dotNetVersion: "Net40" },
  { name: "System.Data.DataSetExtensions.dll", dotNetVersion: "Net40" },
  { name: "System.Data.dll", dotNetVersion: "Net40" },
  { name: "System.DirectoryServices.AccountManagement.dll", dotNetVersion: "Net40" },
  { name: "System.DirectoryServices.dll", dotNetVersion: "Net40" },
  { name: "System.DirectoryServices.Protocols.dll", dotNetVersion: "Net40" },
  { name: "System.Configuration.Install.dll", dotNetVersion: "Net40" },
  { name: "System.dll", dotNetVersion: "Net40" },
  { name: "System.IdentityModel.dll", dotNetVersion: "Net40" }
]

export function ReferenceAssembliesTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 5

  const filteredData = assembliesData.filter(assembly =>
    assembly.name.toLowerCase().includes(searchQuery.toLowerCase())
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
              <TableHead>DotNetVersion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageData().map((assembly, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Link 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {assembly.name}
                  </Link>
                </TableCell>
                <TableCell>{assembly.dotNetVersion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
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

