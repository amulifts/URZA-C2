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

const librariesData = [
  {
    name: "SharpSC",
    supportedDotNetVersions: "Net35,Net40",
    description: "SharpSC is a .NET assembly to perform basic operations with services."
  },
  {
    name: "SharpWMI",
    supportedDotNetVersions: "Net35,Net40",
    description: "SharpWMI is a C# implementation of various WMI functionality."
  },
  {
    name: "SharpUp",
    supportedDotNetVersions: "Net35,Net40",
    description: "SharpUp is a C# port of various PowerUp functionality."
  },
  {
    name: "SharpDump",
    supportedDotNetVersions: "Net35,Net40",
    description: "SharpDump is a C# port of PowerSploit's Out-Minidump.ps1 functionality."
  },
  {
    name: "SharpDPAPI",
    supportedDotNetVersions: "Net35,Net40",
    description: "SharpDPAPI is a C# port of some Mimikatz DPAPI functionality."
  },
  {
    name: "Seatbelt",
    supportedDotNetVersions: "Net35,Net40",
    description: "Seatbelt is a C# project that performs a number of security oriented host-survey 'safety checks'."
  }
]

export function ReferenceSourceLibrariesTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 5

  const filteredData = librariesData.filter(lib =>
    lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lib.description.toLowerCase().includes(searchQuery.toLowerCase())
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
              <TableHead>SupportedDotNetVersions</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageData().map((lib, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Link 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {lib.name}
                  </Link>
                </TableCell>
                <TableCell>{lib.supportedDotNetVersions}</TableCell>
                <TableCell>{lib.description}</TableCell>
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

