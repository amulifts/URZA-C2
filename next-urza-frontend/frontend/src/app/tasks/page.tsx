"use client"

import { useState } from "react"
import { TasksTable } from "@/components/urza/tasks/tasks-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wrench, Search, ChevronUp, Network, Footprints, Key, Play, Eye } from 'lucide-react'

const categories = [
  { value: "miscellaneous", label: "Miscellaneous", icon: Wrench },
  { value: "information", label: "Information Gathering", icon: Search },
  { value: "privilege", label: "Privilege Escalation", icon: ChevronUp },
  { value: "persistence", label: "Persistence", icon: Footprints },
  { value: "lateral", label: "Lateral Movement", icon: Network },
  { value: "credentials", label: "Credential Dumping", icon: Key },
  { value: "execution", label: "Execution", icon: Play },
  { value: "surveillance", label: "Surveillance", icon: Eye },
]

export default function TasksPage() {
  const [selectedCategory, setSelectedCategory] = useState("miscellaneous")

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
      
      <div className="w-full max-w-xs">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TasksTable category={selectedCategory} />
    </div>
  )
}

