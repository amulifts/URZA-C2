import { LaunchersTable } from "@/components/urza/launcher/launcher-table"

export default function LaunchersPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Launchers</h1>
      <LaunchersTable />
    </div>
  )
}

