import { AgentTaskingsTable } from "@/components/urza/taskings/agent-taskings-table"

export default function AgentTaskingsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">AgentTaskings</h1>
      <AgentTaskingsTable />
    </div>
  )
}

