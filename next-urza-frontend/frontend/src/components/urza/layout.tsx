// next-urza-frontend\frontend\src\components\urza\layout.tsx

"use client"

import { cn } from "@/lib/utils"
import { BarChart, Database, Home, Layers, LayoutTemplate, ListEnd, Radio, Share2, Terminal, Users } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserAccountSwitcher } from "@/components/urza/user-account-switcher"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/',
      color: "text-gray-500"
    },
    {
      label: 'Listeners',
      icon: Radio,
      href: '/listeners',
      color: "text-gray-500",
      // isActive: pathname === '/listeners'
    },
    {
      label: 'Launchers',
      icon: Share2,
      href: '/launchers',
      color: "text-gray-500",
    },
    {
      label: 'Agents',
      icon: Terminal,
      href: '/agents',
      color: "text-gray-500",
    },
    {
      label: 'Templates',
      icon: LayoutTemplate,
      href: '/templates',
      color: "text-gray-500",
    },
    {
      label: 'Tasks',
      icon: ListEnd,
      href: '/tasks',
      color: "text-gray-500",
    },
    {
      label: 'Taskings',
      icon: Layers,
      href: '/agent-taskings',
      color: "text-gray-500",
    },
    {
      label: 'Graph',
      icon: BarChart,
      href: '/graph',
      color: "text-gray-500",
    },
    {
      label: 'Users',
      icon: Users,
      href: '/users',
      color: "text-gray-500",
    },
  ]

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col">
        <div className="px-3 py-2 flex-1">
          <div className="space-y-1 py-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-gray-100 rounded-lg transition",
                  pathname === route.href ? "bg-gray-100 text-gray-900" : "text-gray-600",
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  {route.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <UserAccountSwitcher />
        </div>
      </div>
    </div>
  )
}

