// URZA-C2/next-urza-frontend/frontend/src/components/urza/listeners/profile-table.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
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

const profilesData = [
    {
        name: "DefaultHttpProfile",
        description: "A default profile",
        type: "HTTP"
    },
    {
        name: "CustomHttpProfile",
        description: "A custom profile that does not require any cookies",
        type: "HTTP"
    },
    {
        name: "TCPBridgeProfile",
        description: "A default BridgeProfile for a C2Bridge",
        type: "Bridge"
    },
    {
        name: "DefaultBridgeProfile",
        description: "A default BridgeProfile for a C2Bridge",
        type: "Bridge"
    }
]

export function ProfilesTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 2
    const totalPages = Math.ceil(profilesData.length / itemsPerPage)

    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return profilesData.slice(startIndex, startIndex + itemsPerPage)
    }

    return (
        <div className="space-y-4">
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {getCurrentPageData().map((profile, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{profile.name}</TableCell>
                                <TableCell>{profile.description}</TableCell>
                                <TableCell>{profile.type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-end">
            <div className="flex justify-between items-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                </Button>
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

