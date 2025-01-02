// next-urza-frontend\frontend\src\components\urza\user-account-switcher.tsx

"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react'

interface UserData {
    id: number
    username: string
    full_name?: string
    role?: string
    image_url?: string
  }

export function UserAccountSwitcher() {
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState<UserData | null>(null)
    const [allUsers, setAllUsers] = useState<UserData[]>([])
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
  
    // 1) Load the current user from /me
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/users/me", { credentials: "include" })
                if (!res.ok) {
                    if (res.status === 401) {
                        // Not authenticated, redirect to login
                        router.push("/login")
                        return
                    } else {
                        // Other errors
                        throw new Error(`Failed to fetch user data. Status: ${res.status}`)
                    }
                }
                const data: UserData = await res.json()
                setCurrentUser(data)
                if (data.role === "Admin") {
                    setIsAdmin(true)
                }
            } catch (err: any) {
                console.error(err)
                setError("Failed to load user data.")
            } finally {
                setLoading(false)
            }
        }

        fetchCurrentUser()
    }, [router])

    // 2) If isAdmin, load all users
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/users/list", { credentials: "include" })
                if (!res.ok) {
                    throw new Error("Failed to fetch user list.")
                }
                const data: UserData[] = await res.json()
                setAllUsers(data)
            } catch (err: any) {
                console.error(err)
                setError("Failed to load user list.")
            }
        }

        if (isAdmin) {
            fetchAllUsers()
        }
    }, [isAdmin])

    if (loading) {
        return (
            <div className="mx-2 mb-2 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-4">
                <span>Loading...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mx-2 mb-2 rounded-xl border border-red-500 bg-red-100 p-4">
                <span className="text-red-700">{error}</span>
            </div>
        )
    }

    if (!currentUser) {
        return null // Already redirected to login
    }

    // 3) Logout
    const handleLogout = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/users/logout", {
                method: "POST",
                credentials: "include",
            })
            if (res.ok) {
                router.push("/login")
            } else {
                console.error("Failed to logout")
            }
        } catch (err) {
            console.error(err)
        }
    }

    // 4) Impersonate user
    const handleImpersonate = async (userId: number) => {
        try {
            const res = await fetch(`http://localhost:8000/api/users/impersonate/${userId}`, {
                method: "POST",
                credentials: "include",
            })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to impersonate user.")
            }
            const data: UserData = await res.json()
            // After impersonation, reload the user data
            router.refresh() // This will trigger a reload of the current page
        } catch (err: any) {
            console.error(err)
            // Optionally, display an error message to the user
        }
    }

    return (
        <DropdownMenu>
            <style jsx global>{`
        .user-account-switcher-content {
          max-height: calc(100vh - 100px);
          overflow-y: auto;
        }
      `}</style>
            <div className="mx-2 mb-2 rounded-xl border border-gray-200 bg-white">
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full flex items-center gap-3 p-4 h-auto relative">
                        <div className="relative">
                            <Avatar className="h-9 w-9 rounded-sm border">
                                <AvatarImage src={currentUser.image_url || "/placeholder.svg"} alt={currentUser.username} className="rounded-sm" />
                                <AvatarFallback className="rounded-sm">{currentUser.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold leading-tight">{currentUser.full_name || currentUser.username}</p>
                            <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                        </div>
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent className="w-[280px] user-account-switcher-content" align="end" alignOffset={-6} sideOffset={8} forceMount>
                
                {/* If Admin, show the user-switching section */}
                {isAdmin && (
                <div className="px-2 pt-2 pb-1">
                    <h4 className="text-sm font-medium leading-none mb-3">Switch account</h4>
                    <div className="space-y-1">
                        {allUsers.map((user) => {
                            const isActive = user.id === currentUser.id;
                            return (
                                // DropdownMenuItem is a styled <button>
                                <button
                                    key={user.id}
                                    onClick={() => handleImpersonate(user.id)}
                                    className={`w-full flex items-center gap-3 rounded-lg p-2 transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="relative">
                                        <Avatar className="h-9 w-9 rounded-sm border">
                                            <AvatarImage src={user.image_url || "/placeholder.svg"} alt={user.username} className="rounded-sm" />
                                            <AvatarFallback className="rounded-sm">{user.username[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${isActive ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium">{user.full_name || user.username}</span>
                                        <span className="text-xs text-muted-foreground">{user.role}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                )}

                <DropdownMenuSeparator className="my-1" />
                <div className="p-2">
                    <DropdownMenuItem
                        className="w-full flex items-center gap-2 rounded-lg p-2 text-sm cursor-pointer"
                        onClick={() => router.push(`/users/${currentUser.username.toLowerCase().replace(' ', '-')}`)}
                    >
                        <Settings className="h-4 w-4" />
                        Account settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="w-full flex items-center gap-2 rounded-lg p-2 text-sm cursor-pointer text-red-600" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

