import { NetworkGraph } from "@/components/urza/graph/network-graph"

export default function GraphPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Graph</h1>
      <NetworkGraph />
    </div>
  )
}

