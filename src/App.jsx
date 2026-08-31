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
import CreateRoadModal from './components/CreateRoadModal';
import CreateSectorModal from './components/CreateSectorModal';
import { fetchPlayerData, updateSetorStatus } from './request/request';

function FlowMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [dayCount, setDayCount] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [baseId, setBaseId] = useState(null);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [pendingNewSector, setPendingNewSector] = useState(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  const onEdgeMouseEnter = useCallback((event, edge) => {
    setHoveredEdgeId(edge.id);
  }, []);

  const onEdgeMouseLeave = useCallback((event, edge) => {
    setHoveredEdgeId(null);
  }, []);

  const handleToggleTrouble = useCallback((nodeId) => {
    setNodes((nds) => {
      const targetNode = nds.find((n) => n.id === nodeId);
      if (!targetNode) return nds;

      const newStatus = targetNode.data.status === 'OPERANDO' ? 'INTERDITADO' : 'OPERANDO';
      const dependentStatus = newStatus === 'INTERDITADO' ? 'SEM_ENERGIA' : 'OPERANDO';

      // Atualiza o banco de forma assíncrona
      updateSetorStatus(nodeId, newStatus);
      nds.forEach(n => {
        // Cascata apenas para OUTROS setores que dependem da energia deste
        if (n.data.setor_energia_provedor_id === nodeId && n.id !== nodeId) {
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
        
        // Efeito cascata para os dependentes de energia (excluindo ele mesmo)
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPlayerData('A26-I99'); // using new ID
      
      const responseObj = Array.isArray(data) ? data[0] : data;

      if (responseObj && responseObj.bases && responseObj.bases.length > 0) {
        const primeiraBase = responseObj.bases[0];
        setBaseId(primeiraBase.id); // store baseId

        const setores = primeiraBase.setores || [];
        const estradas = primeiraBase.estradas || [];
        
        const playerInfo = {
          id: responseObj.id,
          nome: responseObj.nome,
          baseId: primeiraBase.id
        };
        
        const layoutMap = [
          // Original core (12)
          { x: 0, y: 0, width: 250, height: 200 },     
          { x: 0, y: 220, width: 250, height: 150 },   
          { x: 0, y: 390, width: 250, height: 150 },   
          { x: 270, y: 0, width: 150, height: 370 },   
          { x: 440, y: 150, width: 250, height: 390 }, 
          { x: 440, y: 0, width: 400, height: 130 },   
          { x: 710, y: 150, width: 350, height: 390 }, 
          { x: 1080, y: 150, width: 100, height: 390 },
          { x: 1200, y: 150, width: 100, height: 250 },
          { x: 0, y: 560, width: 420, height: 150 }, 
          { x: 440, y: 560, width: 620, height: 150 }, 
          { x: 1080, y: 560, width: 220, height: 150 },
          
          // Expanded right
          { x: 1200, y: 420, width: 100, height: 290 },
          { x: 1320, y: 150, width: 200, height: 250 },
          { x: 1320, y: 420, width: 200, height: 290 },
          { x: 860, y: 0, width: 440, height: 130 },
          { x: 1320, y: 0, width: 200, height: 130 },
          
          // Expanded left
          { x: -270, y: 0, width: 250, height: 200 },
          { x: -270, y: 220, width: 250, height: 150 },
          { x: -270, y: 390, width: 250, height: 320 },
          { x: -540, y: 0, width: 250, height: 370 },
          { x: -540, y: 390, width: 250, height: 320 },
          
          // Expanded top
          { x: 0, y: -220, width: 420, height: 200 },
          { x: 440, y: -220, width: 400, height: 200 },
          { x: 860, y: -220, width: 440, height: 200 },
          { x: 1320, y: -220, width: 200, height: 200 },
          { x: -270, y: -220, width: 250, height: 200 },
          { x: -540, y: -220, width: 250, height: 200 },

          // Expanded bottom
          { x: 0, y: 730, width: 420, height: 200 },
          { x: 440, y: 730, width: 620, height: 200 },
          { x: 1080, y: 730, width: 440, height: 200 },
          { x: -270, y: 730, width: 250, height: 200 },
          { x: -540, y: 730, width: 250, height: 200 }
        ];

        // Dynamically append a massive grid around the edges to ensure infinite expansion
        const gap = 20;
        const eWidth = 250;
        const eHeight = 150;
        
        // Add 500 extra slots around the core area
        for(let r = -5; r <= 8; r++) {
            for(let c = -5; c <= 8; c++) {
               // roughly avoid the core area coordinates (0 to 1320, 0 to 730)
               const bx = c * (eWidth + gap);
               const by = r * (eHeight + gap);
               
               // If it's outside the handcrafted bounding box, add it to layout map
               if (bx < -600 || bx > 1500 || by < -300 || by > 900) {
                   layoutMap.push({ x: bx, y: by, width: eWidth, height: eHeight });
               }
            }
        }

        const initializedNodes = [];
        const usedLayoutIndices = new Set();
        const occupiedLayouts = [];

        // 1. Process all existing sectors
        setores.forEach((setor) => {
          let layoutIndex = layoutMap.findIndex(l => 
             setor.posicao && l.x === Math.round(setor.posicao.x) && l.y === Math.round(setor.posicao.y)
          );
          
          if (layoutIndex === -1) {
            layoutIndex = layoutMap.findIndex((_, i) => !usedLayoutIndices.has(i));
          }
          
          if (layoutIndex !== -1) {
            usedLayoutIndices.add(layoutIndex);
            const layout = layoutMap[layoutIndex];
            occupiedLayouts.push(layout);
            initializedNodes.push({
              id: setor.id,
              type: 'sector',
              position: { x: layout.x, y: layout.y },
              data: {
                ...setor,
                width: layout.width,
                height: layout.height,
                playerInfo: setor.id.includes('SET_CENTRO') ? playerInfo : null,
                onToggleTrouble: () => handleToggleTrouble(setor.id),
                isEmpty: false
              }
            });
          }
        });

        // 2. Generate adjacent empty lots
        // A layout is adjacent if its bounds are within 50px of any occupied layout
        const isAdjacent = (l1, l2) => {
           const gapTolerance = 50;
           const overlapX = l1.x <= (l2.x + l2.width + gapTolerance) && (l1.x + l1.width + gapTolerance) >= l2.x;
           const overlapY = l1.y <= (l2.y + l2.height + gapTolerance) && (l1.y + l1.height + gapTolerance) >= l2.y;
           return overlapX && overlapY;
        };

        let emptySpotsAdded = 0;
        layoutMap.forEach((layout, index) => {
          if (!usedLayoutIndices.has(index)) {
            const isNearOccupied = (occupiedLayouts.length === 0 && index === 0) || 
                                   occupiedLayouts.some(occ => isAdjacent(layout, occ));
            
            if (isNearOccupied) {
              emptySpotsAdded++;
              initializedNodes.push({
                id: `empty_${index}`,
                type: 'sector',
                position: { x: layout.x, y: layout.y },
                data: {
                  width: layout.width,
                  height: layout.height,
                  isEmpty: true,
                  layoutX: layout.x,
                  layoutY: layout.y,
                  onCreateClick: () => setPendingNewSector({ x: layout.x, y: layout.y })
                }
              });
            }
          }
        });

        // Failsafe: if somehow NO empty spots were added (e.g. they reached the edge of adjacency), 
        // forcibly add the FIRST available unused slot so they can ALWAYS expand.
        if (emptySpotsAdded === 0) {
            const fallbackIndex = layoutMap.findIndex((_, i) => !usedLayoutIndices.has(i));
            if (fallbackIndex !== -1) {
                const fl = layoutMap[fallbackIndex];
                initializedNodes.push({
                    id: `empty_${fallbackIndex}`,
                    type: 'sector',
                    position: { x: fl.x, y: fl.y },
                    data: {
                      width: fl.width,
                      height: fl.height,
                      isEmpty: true,
                      layoutX: fl.x,
                      layoutY: fl.y,
                      onCreateClick: () => setPendingNewSector({ x: fl.x, y: fl.y })
                    }
                });
            }
        }

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
  }, [handleToggleTrouble, setNodes, setEdges]);

  // Initialize nodes and edges from Supabase RPC
  useEffect(() => {
    loadData();
  }, [loadData]);

  const onConnect = useCallback(
    (params) => {
      // Abre o modal de criar estrada ao invés de apenas conectar localmente
      setPendingConnection(params);
    },
    []
  );

  const onTimeSkipComplete = useCallback(async (dias) => {
    setDayCount((prev) => prev + dias);
    await loadData();
  }, [loadData]);

  const onNodeClick = useCallback((event, node) => {
    if (node.data?.isEmpty) return;
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onEdgesDelete = useCallback(
    async (edgesToDelete) => {
      const { deletarEstrada } = await import('./services/deleteService');
      
      for (const edge of edgesToDelete) {
        const res = await deletarEstrada(edge.id);
        if (res && res.success) {
          console.log('Estrada desconectada:', edge.id);
        } else {
          console.error('Falha ao desconectar estrada', edge.id);
        }
      }
    },
    []
  );

  const onNodesDelete = useCallback(
    async (nodesToDelete) => {
      const { deletarSetor } = await import('./services/deleteService');
      
      for (const n of nodesToDelete) {
        const res = await deletarSetor(n.id);
        if (res && res.success) {
          console.log('Setor e estruturas internas deletados com sucesso:', n.id);
        } else {
          console.error('Falha ao deletar setor', n.id);
        }
      }
    },
    []
  );

  const nodeTypes = useMemo(() => ({ sector: SectorNode }), []);

  const currentEdges = useMemo(() => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const isTrouble = sourceNode?.data?.status !== 'OPERANDO';
      const isHovered = edge.id === hoveredEdgeId;
      
      return {
        ...edge,
        type: 'smoothstep', // Use orthogonal routing to look like streets
        animated: !isTrouble,
        label: isHovered ? edge.label : undefined,
        zIndex: isHovered ? 1000 : 0, // Boost zIndex when hovered to show on top of everything
        style: {
          ...edge.style,
          stroke: isTrouble ? '#7f1d1d' : '#1e293b', // darker streets
          strokeWidth: isHovered ? (isTrouble ? 6 : 5) : (isTrouble ? 4 : 3), // Make edge thicker when hovered
          cursor: 'pointer' // Add pointer cursor
        },
        labelBgPadding: [12, 6],
        labelBgBorderRadius: 6,
        labelBgStyle: { fill: '#ffffff', fillOpacity: 1, stroke: '#1e293b', strokeWidth: 2 },
        labelStyle: { fill: '#0f172a', fontWeight: 'bold', fontSize: 14, fontFamily: 'sans-serif' },
      };
    });
  }, [edges, nodes, hoveredEdgeId]);

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
      <HUD dayCount={dayCount} baseId={baseId} onTimeSkipComplete={onTimeSkipComplete} />
      
      <DetailsPanel 
        node={selectedNode} 
        providerNode={nodes.find(n => n.id === selectedNode?.data?.setor_energia_provedor_id)}
        onClose={() => setSelectedNodeId(null)} 
        onToggleTrouble={handleToggleTrouble}
        nodes={nodes}
        edges={edges}
      />

      <ReactFlow
        nodes={nodes}
        edges={currentEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: '#8fa080' }}
        nodesDraggable={false}
      >
        <Controls className="!bg-white !border-slate-300 !fill-slate-700" />
      </ReactFlow>

      {pendingConnection && (
        <CreateRoadModal 
          connection={pendingConnection}
          nodes={nodes}
          onClose={() => setPendingConnection(null)}
        />
      )}

      {pendingNewSector && (
        <CreateSectorModal 
          baseId={baseId}
          defaultX={pendingNewSector.x}
          defaultY={pendingNewSector.y}
          onClose={(shouldReload) => {
            setPendingNewSector(null);
            if (shouldReload) loadData();
          }}
        />
      )}
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
