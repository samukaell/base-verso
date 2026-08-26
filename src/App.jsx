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

// Importing mock data V2
import mockData from './mok/dados.json';

function FlowMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [dayCount, setDayCount] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const handleToggleTrouble = useCallback((nodeId) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const isOperando = n.data.status === 'OPERANDO';
          return {
            ...n,
            data: { 
              ...n.data, 
              status: isOperando ? 'CONFLITO' : 'OPERANDO' 
            }
          };
        }
        return n;
      })
    );
  }, [setNodes]);

  // Initialize nodes and edges from mock data
  useEffect(() => {
    const setores = mockData.base_rpg.setores || [];
    const estradas = mockData.base_rpg.estradas || [];

    const initializedNodes = setores.map(setor => ({
      id: setor.id,
      type: 'sector',
      position: setor.posicao,
      data: {
        ...setor,
        onToggleTrouble: () => handleToggleTrouble(setor.id)
      }
    }));
    setNodes(initializedNodes);

    const initializedEdges = estradas.map(estrada => ({
      id: estrada.id,
      source: estrada.origem_setor_id,
      target: estrada.destino_setor_id,
      label: estrada.nome,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 }
    }));
    setEdges(initializedEdges);
  }, [handleToggleTrouble, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const advanceDowntime = useCallback(() => {
    setDayCount((prev) => prev + 1);
    
    // V2: Downtime logic is purely visual for now on the app state 
    // since the real logic would update nested items_armazenados based on processos_ativos
    setNodes((nds) =>
      nds.map((n) => {
        if (n.data.status !== 'OPERANDO') return n; // Blocked

        // Simple mock of production: +5% on all items inside silos just to show it running
        const newDistritos = (n.data.distritos_armazenamento || []).map(arm => ({
          ...arm,
          itens_armazenados: (arm.itens_armazenados || []).map(item => ({
            ...item,
            quantidade_atual_ton: item.quantidade_atual_ton + 2.5 // Add arbitrary amount for demo
          }))
        }));

        return {
          ...n,
          data: {
            ...n.data,
            distritos_armazenamento: newDistritos
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
      const isTrouble = sourceNode?.data?.status !== 'OPERANDO';
      
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
