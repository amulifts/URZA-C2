// next-urza-frontend/frontend/src/components/urza/user-account-switcher.tsx

"use client"

import React, { useEffect, useState, useContext } from "react"
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
import { AuthContext } from "@/context/AuthContext"
import axios from 'axios'
import jwtDecode from 'jwt-decode' // Corrected import
import { toast } from 'react-toastify';

interface UserData {
    id: number
    username: string
    full_name?: string
    role: string
    image_url?: string
}

export function UserAccountSwitcher() {
    const router = useRouter()
    const { user, logout, setUser } = useContext(AuthContext)
    const [allUsers, setAllUsers] = useState<UserData[]>([])
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            if (user.role === "Admin") {
                setIsAdmin(true)
                fetchAllUsers()
            }
            setLoading(false)
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchAllUsers = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/list`, { withCredentials: true })
            setAllUsers(res.data)
        } catch (err: any) {
            console.error(err)
            setError("Failed to load user list.")
        }
    }

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

    if (!user) {
        return null // User is not authenticated
    }

    // Logout Function
    const handleLogout = async () => {
        try {
            await logout()
        } catch (err) {
            console.error(err)
        }
    }

    // Impersonate Function
    const handleImpersonate = async (userId: number) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/impersonate/${userId}`, {}, {
                withCredentials: true,
            });
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            const decoded: any = jwtDecode(access);
            // Update user context
            setUser({
                id: decoded.user_id,
                username: decoded.username,
                full_name: decoded.full_name,
                role: decoded.role,
            });
            toast.success(`Impersonated as ${decoded.username}. Redirecting to main page...`);
            router.push("/main");
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to impersonate user.");
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
                                <AvatarFallback className="rounded-sm">
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold leading-tight">{user.full_name || user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.role}</p>
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
                            {allUsers.map((u) => {
                                const isActive = u.id === user.id;
                                return (
                                    // DropdownMenuItem is a styled <button>
                                    <button
                                        key={u.id}
                                        onClick={() => handleImpersonate(u.id)}
                                        className={`w-full flex items-center gap-3 rounded-lg p-2 transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-9 w-9 rounded-sm border">
                                                <AvatarImage src={u.image_url || "/placeholder.svg"} alt={u.username} className="rounded-sm" />
                                                <AvatarFallback className="rounded-sm">{u.full_name ? u.full_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div
                                                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${isActive ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium">{u.full_name || u.username}</span>
                                            <span className="text-xs text-muted-foreground">{u.role}</span>
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
                        onClick={() => router.push(`/users/${user.username.toLowerCase().replace(' ', '-')}`)}
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
