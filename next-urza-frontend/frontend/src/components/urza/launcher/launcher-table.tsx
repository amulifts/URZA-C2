// next-urza-frontend\frontend\src\components\urza\launcher\launcher-table.tsx

"use client"

import { useState } from "react"
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

const launchersData = [
  {
    name: "csharp",
    description: "Stage via CSharp source file"
  },
  {
    name: "dll",
    description: "Generates a windows dll stager"
  },
  {
    name: "exe",
    description: "Generates a windows executable stager"
  },
  {
    name: "msbuild",
    description: "Stage via MSBuild XML inline C# task"
  },
  {
    name: "powershell",
    description: "Stage via a PowerShell script"
  },
  {
    name: "powershell_stageless",
    description: "Embeds the BooLang Compiler within PowerShell and directly executes STs stager"
  },
  {
    name: "raw",
    description: "Generate a raw binary file to use how you see fit"
  },
  {
    name: "shellcode",
    description: "Generate a shellcode payload"
  },
  {
    name: "wmic",
    description: "Stage via wmic XSL execution"
  }
]

export function LaunchersTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(launchersData.length / itemsPerPage)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return launchersData.slice(startIndex, startIndex + itemsPerPage)
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageData().map((launcher, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <Link 
                    href={`/launchers/${launcher.name}`} 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {launcher.name}
                  </Link>
                </TableCell>
                <TableCell className="max-w-2xl">{launcher.description}</TableCell>
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

