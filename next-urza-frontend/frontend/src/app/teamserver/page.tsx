// next-urza-frontend/frontend/src/app/teamserver/page.tsx

import { TeamServerClientConnection } from "@/components/urza/teamserver/teamserver"

export default function TeamServerPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">TeamServer</h1>
      <TeamServerClientConnection />
    </div>
  )
}
