"use client"

import { useCallback, useRef, useState } from 'react'
// import ForceGraph2D from 'react-force-graph-2d'
import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Graph data structure
const graphData = {
  nodes: [
    { 
      id: "listener1", 
      name: "My Listener",
      type: "listener",
      description: "Listens on HTTP protocol.",
      urls: "http://10.211.55.16:80"
    },
    { 
      id: "4e08e14e3f", 
      name: "4e08e14e3f",
      type: "session-http",
      description: "HTTP Agent",
      status: "Active"
    }
  ],
  links: [
    { source: "4e08e14e3f", target: "listener1" }
  ]
}

interface NodeData {
  id: string
  name: string
  type: string
  description: string
  urls?: string
  status?: string
}

export function NetworkGraph() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const graphRef = useRef<any>(null)

  // Node color based on type
  const getNodeColor = (node: NodeData) => {
    switch (node.type) {
      case 'listener':
        return '#ef4444' // red
      case 'session-http':
        return '#3b82f6' // blue
      case 'session-https':
        return '#22c55e' // green
      default:
        return '#94a3b8' // gray
    }
  }

  // Handle node click
  const handleNodeClick = useCallback((node: NodeData) => {
    setSelectedNode(node)
  }, [])

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      <div className="flex-1 bg-white rounded-lg border shadow-sm">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel="name"
          nodeColor={getNodeColor}
          nodeRelSize={8}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          onNodeClick={handleNodeClick}
          backgroundColor="#ffffff"
          width={800}
          height={600}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.08}
          cooldownTicks={100}
        />
      </div>
      
      <div className="w-80 space-y-4" style={{ alignSelf: 'center' }}>
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Listener</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>session (http)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>session (https)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Node Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedNode && (
              <>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={selectedNode.name} 
                    disabled 
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={selectedNode.description} 
                    disabled 
                    className="bg-gray-100"
                  />
                </div>
                {selectedNode.urls && (
                  <div className="space-y-2">
                    <Label>URLs</Label>
                    <Input 
                      value={selectedNode.urls} 
                      disabled 
                      className="bg-gray-100"
                    />
                  </div>
                )}
                {selectedNode.status && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Input 
                      value={selectedNode.status} 
                      disabled 
                      className="bg-gray-100"
                    />
                  </div>
                )}
              </>
            )}
            {!selectedNode && (
              <p className="text-sm text-gray-500">
                Select a node to view its details
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

