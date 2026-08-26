import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import SectorNode from './components/SectorNode';
import HUD from './components/HUD';
import DetailsPanel from './components/DetailsPanel';

// Importing mock data
import mockData from './mock/dados.json';

function FlowMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [dayCount, setDayCount] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const handleToggleTrouble = useCallback((nodeId) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const newTrouble = !n.data.trouble;
          return {
            ...n,
            data: { ...n.data, trouble: newTrouble }
          };
        }
        return n;
      })
    );
  }, [setNodes]);

  // Initialize nodes and edges from mock data
  useEffect(() => {
    const initializedNodes = mockData.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggleTrouble: () => handleToggleTrouble(node.id)
      }
    }));
    setNodes(initializedNodes);
    setEdges(mockData.edges);
  }, [handleToggleTrouble, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const advanceDowntime = useCallback(() => {
    setDayCount((prev) => prev + 1);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.data.trouble) return n; // Skip production if in trouble
        
        let newSilo = n.data.siloCurrent + (n.data.productionRate || 0);
        if (newSilo > n.data.siloMax) newSilo = n.data.siloMax;

        return {
          ...n,
          data: {
            ...n.data,
            siloCurrent: newSilo
          }
        };
      })
    );
  }, [setNodes]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const nodeTypes = useMemo(() => ({ sector: SectorNode }), []);

  // Update edge styles based on source node trouble status
  const currentEdges = useMemo(() => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const isTrouble = sourceNode?.data?.trouble;
      
      return {
        ...edge,
        animated: !isTrouble, // stop animation if blocked
        style: {
          ...edge.style,
          stroke: isTrouble ? '#ef4444' : edge.style.stroke,
          strokeWidth: isTrouble ? 3 : 2
        }
      };
    });
  }, [edges, nodes]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="w-screen h-screen relative">
      <HUD onAdvanceDowntime={advanceDowntime} dayCount={dayCount} />
      
      <DetailsPanel 
        node={selectedNode} 
        onClose={() => setSelectedNodeId(null)} 
        onToggleTrouble={handleToggleTrouble}
      />

      <ReactFlow
        nodes={nodes}
        edges={currentEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-950"
      >
        <Background color="#1e293b" gap={24} size={2} />
        <Controls className="!bg-slate-800 !border-slate-700 !fill-slate-300" />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowMap />
    </ReactFlowProvider>
  );
}
