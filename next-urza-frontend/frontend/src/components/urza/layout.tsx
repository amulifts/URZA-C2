// URZA-C2/next-urza-frontend/frontend/src/components/urza/layout.tsx

"use client";

import { useState, useContext } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart,
  ChevronDown,
  ChevronRight,
  Layers,
  LayoutTemplate,
  ListEnd,
  Radio,
  Server,
  Share2,
  Terminal,
  Users,
  Zap,
  Power,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { UserAccountSwitcher } from "@/components/urza/user-account-switcher";
import { Badge } from "@/components/ui/badge";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface RouteItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  color?: string;
  badge?: string;
  children?: RouteItem[];
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const { user } = useContext(AuthContext);

  const routes: RouteItem[] = [
    {
      label: "TeamServer",
      icon: Server,
      color: "text-gray-500",
      children: [
        {
          label: "Server Connection",
          icon: Power,
          href: "/teamserver",
        },
        {
          label: "Client Connection",
          icon: Zap,
          href: "/teamserver-client",
        },
      ],
    },
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      color: "text-gray-500",
    },
    {
      label: "Listeners",
      icon: Radio,
      href: "/listeners",
      color: "text-gray-500",
    },
    {
      label: "Launchers",
      icon: Share2,
      href: "/launchers",
      color: "text-gray-500",
    },
    {
      label: "Agents",
      icon: Terminal,
      href: "/agents",
      color: "text-gray-500",
    },
    {
      label: "Tasks",
      icon: ListEnd,
      href: "/tasks",
      color: "text-gray-500",
    },
    {
      label: "Taskings",
      icon: Layers,
      href: "/agent-taskings",
      color: "text-gray-500",
    },
    {
      label: "Graph",
      icon: BarChart,
      href: "/graph",
      color: "text-gray-500",
    },
  ];

  if (user?.role === "Admin") {
    routes.push({
      label: "Users",
      icon: Users,
      href: "/users",
      color: "text-gray-500",
    });
  }

  const toggleCategory = (label: string) => {
    setOpenCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const renderRouteItem = (item: RouteItem, depth = 0) => {
    const isActive = item.href ? pathname === item.href : false;
    const isOpen = openCategories.includes(item.label);

    if (item.children) {
      return (
        <Collapsible
          key={item.label}
          open={isOpen}
          onOpenChange={() => toggleCategory(item.label)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between",
                depth > 0 && "pl-8",
                isOpen && "bg-gray-100"
              )}
            >
              <span className="flex items-center">
                <item.icon className={cn("h-5 w-5 mr-3", item.color)} />
                {item.label}
              </span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {item.children.map((child) => renderRouteItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <NextLink
        key={item.href || item.label}
        href={item.href || "#"}
        className={cn(
          "flex items-center p-3 w-full text-sm font-medium cursor-pointer hover:bg-gray-100 rounded-lg transition",
          isActive ? "bg-gray-100 text-gray-900" : "text-gray-600",
          depth > 0 && "pl-8"
        )}
      >
        <item.icon className={cn("h-5 w-5 mr-3", item.color)} />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <Badge variant="outline" className="ml-auto">
            {item.badge}
          </Badge>
        )}
      </NextLink>
    );
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col">
        <div className="px-3 py-2 flex-1">
          <div className="space-y-1 py-4">{routes.map((route) => renderRouteItem(route))}</div>
        </div>
        <div className="mt-auto">
          <UserAccountSwitcher />
        </div>
      </div>
    </div>
  );
}
