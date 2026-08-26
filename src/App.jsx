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
import { fetchPlayerData, updateSetorStatus } from './request/request';

function FlowMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [dayCount, setDayCount] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleToggleTrouble = useCallback((nodeId) => {
    setNodes((nds) => {
      const targetNode = nds.find((n) => n.id === nodeId);
      if (!targetNode) return nds;

      const newStatus = targetNode.data.status === 'OPERANDO' ? 'CONFLITO' : 'OPERANDO';
      const dependentStatus = newStatus === 'CONFLITO' ? 'SEM_ENERGIA' : 'OPERANDO';

      // Atualiza o banco de forma assíncrona
      updateSetorStatus(nodeId, newStatus);
      nds.forEach(n => {
        if (n.data.setor_energia_provedor_id === nodeId) {
          updateSetorStatus(n.id, dependentStatus);
        }
      });

      return nds.map((n) => {
        // Toggle no setor clicado
        if (n.id === nodeId) {
          return {
            ...n,
            data: { ...n.data, status: newStatus }
          };
        }
        
        // Efeito cascata para os dependentes de energia
        if (n.data.setor_energia_provedor_id === nodeId) {
          return {
            ...n,
            data: { ...n.data, status: dependentStatus }
          };
        }

        return n;
      });
    });
  }, [setNodes]);

  // Initialize nodes and edges from Supabase RPC
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPlayerData('A26-I99'); // using new ID
        
        // Supabase RPCs might return an array with one object, or the object directly.
        const responseObj = Array.isArray(data) ? data[0] : data;

        if (responseObj && responseObj.bases && responseObj.bases.length > 0) {
          const primeiraBase = responseObj.bases[0];
          const setores = primeiraBase.setores || [];
          const estradas = primeiraBase.estradas || [];
          
          const playerInfo = {
            id: responseObj.id,
            nome: responseObj.nome,
            baseId: primeiraBase.id
          };

          const initializedNodes = setores.map(setor => ({
            id: setor.id,
            type: 'sector',
            position: setor.posicao || { x: Math.random() * 500, y: Math.random() * 500 }, // fallback se não vier do back
            data: {
              ...setor,
              playerInfo: setor.id.includes('SET_CENTRO') ? playerInfo : null,
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
        }
      } catch (error) {
        console.error("Failed to load map data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [handleToggleTrouble, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const advanceDowntime = useCallback(() => {
    setDayCount((prev) => prev + 1);
    
    setNodes((nds) =>
      nds.map((n) => {
        if (n.data.status !== 'OPERANDO') return n;

        const newDistritos = (n.data.distritos_armazenamento || []).map(arm => ({
          ...arm,
          itens_armazenados: (arm.itens_armazenados || []).map(item => ({
            ...item,
            quantidade_atual_ton: item.quantidade_atual_ton + 2.5
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

  const currentEdges = useMemo(() => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const isTrouble = sourceNode?.data?.status !== 'OPERANDO';
      
      return {
        ...edge,
        animated: !isTrouble,
        style: {
          ...edge.style,
          stroke: isTrouble ? '#ef4444' : edge.style.stroke,
          strokeWidth: isTrouble ? 3 : 2
        }
      };
    });
  }, [edges, nodes]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-sky-400">
        <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold font-mono tracking-widest">Sincronizando com Supabase...</h2>
      </div>
    );
  }

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
