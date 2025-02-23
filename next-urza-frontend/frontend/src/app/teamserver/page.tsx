// URZA-C2/next-urza-frontend/frontend/src/app/teamserver/page.tsx

import { TeamServer } from "@/components/urza/teamserver/teamserver"

export default function TeamServerPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">TeamServer</h1>
      <TeamServer />
    </div>
  )
}

