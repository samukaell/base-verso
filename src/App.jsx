import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useNodes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getSmartEdge } from '@tisoap/react-flow-smart-edge';

import SectorNode from './components/SectorNode';
import FichaNode from './components/FichaNode';
import HUD from './components/HUD';
import DetailsPanel from './components/DetailsPanel';
import CreateRoadModal from './components/CreateRoadModal';
import CreateSectorModal from './components/CreateSectorModal';
import CreateFichaModal from './components/CreateFichaModal';
import CursorTracker from './components/CursorTracker';
import { fetchPlayerData, updateSetorStatus, listarTodosProcessosBase, atualizarStatusFicha, listarFichasBase } from './request/request';

const nodeTypes = {
  sector: SectorNode,
  ficha: FichaNode
};

function createGridPath(sourceX, sourceY, targetX, targetY, nodes) {
  const GRID = 10;
  
  let minX = Math.min(sourceX, targetX) - 50;
  let maxX = Math.max(sourceX, targetX) + 50;
  let minY = Math.min(sourceY, targetY) - 50;
  let maxY = Math.max(sourceY, targetY) + 50;
  
  nodes.forEach(n => {
    if (n.position.x < minX) minX = n.position.x;
    if (n.position.x + n.width > maxX) maxX = n.position.x + n.width;
    if (n.position.y < minY) minY = n.position.y;
    if (n.position.y + n.height > maxY) maxY = n.position.y + n.height;
  });

  minX = Math.floor(minX / GRID) * GRID;
  minY = Math.floor(minY / GRID) * GRID;
  maxX = Math.ceil(maxX / GRID) * GRID;
  maxY = Math.ceil(maxY / GRID) * GRID;
  
  const cols = Math.max(1, (maxX - minX) / GRID + 1);
  const rows = Math.max(1, (maxY - minY) / GRID + 1);
  
  const grid = new Uint8Array(cols * rows);
  
  nodes.forEach(n => {
    const l = Math.floor((n.position.x - minX) / GRID);
    const r = Math.ceil((n.position.x + n.width - minX) / GRID);
    const t = Math.floor((n.position.y - minY) / GRID);
    const b = Math.ceil((n.position.y + n.height - minY) / GRID);
    for (let x = l; x <= r; x++) {
      for (let y = t; y <= b; y++) {
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          grid[y * cols + x] = 1;
        }
      }
    }
  });
  
  const sX = Math.max(0, Math.min(cols - 1, Math.round((sourceX - minX) / GRID)));
  const sY = Math.max(0, Math.min(rows - 1, Math.round((sourceY - minY) / GRID)));
  const eX = Math.max(0, Math.min(cols - 1, Math.round((targetX - minX) / GRID)));
  const eY = Math.max(0, Math.min(rows - 1, Math.round((targetY - minY) / GRID)));
  
  // Liberar saída e chegada
  grid[sY * cols + sX] = 0;
  grid[eY * cols + eX] = 0;
  
  const queue = new Uint32Array(cols * rows * 2);
  const parent = new Int32Array(cols * rows).fill(-1);
  const visited = new Uint8Array(cols * rows);
  
  let head = 0;
  let tail = 0;
  
  queue[tail++] = sX;
  queue[tail++] = sY;
  visited[sY * cols + sX] = 1;
  
  const dirs = [0, -1, 1, 0, 0, 1, -1, 0];
  let found = false;
  
  while(head < tail) {
    const cx = queue[head++];
    const cy = queue[head++];
    const cidx = cy * cols + cx;
    
    if (cx === eX && cy === eY) {
      found = true;
      break;
    }
    
    for (let i = 0; i < 8; i += 2) {
      const nx = cx + dirs[i];
      const ny = cy + dirs[i+1];
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        const nidx = ny * cols + nx;
        if (grid[nidx] === 0 && visited[nidx] === 0) {
          visited[nidx] = 1;
          parent[nidx] = cidx;
          queue[tail++] = nx;
          queue[tail++] = ny;
        }
      }
    }
  }
  
  if (!found) return null;
  
  const path = [];
  let curr = eY * cols + eX;
  while(curr !== -1) {
    const py = Math.floor(curr / cols);
    const px = curr % cols;
    path.push({ x: px * GRID + minX, y: py * GRID + minY });
    curr = parent[curr];
  }
  path.reverse();
  
  let svg = `M ${sourceX} ${sourceY}`;
  for (let i = 1; i < path.length; i++) {
    svg += ` L ${path[i].x} ${path[i].y}`;
  }
  svg += ` L ${targetX} ${targetY}`;
  
  return { 
    svgPathString: svg, 
    edgeCenterX: path[Math.floor(path.length/2)].x, 
    edgeCenterY: path[Math.floor(path.length/2)].y 
  };
}

const CustomSmartEdge = (props) => {
  const { 
    id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, 
    style, markerEnd, label, labelStyle, labelBgStyle
  } = props;
  const nodes = useNodes();
  
  const pathfindingNodes = nodes
    .filter(n => n.id !== source && n.id !== target)
    .map(n => {
      const w = n.measured?.width || n.width || n.data?.width || 250;
      const h = n.measured?.height || n.height || n.data?.height || 150;
      const isEmpty = n.data?.isEmpty;
      const isFicha = n.type === 'ficha';
      
      let expand = 2; // Apenas padding
      let offset = 1;
      
      if (isEmpty) {
        expand = 0;
        offset = 0;
      } else if (isFicha) {
        expand = 10;
        offset = 5;
      }

      return {
        ...n,
        position: {
          x: n.position.x - offset, 
          y: n.position.y - offset
        },
        width: w + expand,
        height: h + expand
      };
    });

  const sourceNode = nodes.find(n => n.id === source);
  const targetNode = nodes.find(n => n.id === target);
  
  const sourceIsSector = sourceNode && sourceNode.type !== 'ficha' && !sourceNode.data?.isEmpty;
  const targetIsSector = targetNode && targetNode.type !== 'ficha' && !targetNode.data?.isEmpty;

  const getBuildingHeight = (node) => {
    return 15 + (Number(node?.data?.nivel_defesa) || 0) * 1;
  };

  // A linha deve começar na Base do prédio, não no telhado! 
  // Por isso somamos o offset dinâmico baseado na altura real daquele prédio.
  const sx = sourceX + (sourceIsSector ? getBuildingHeight(sourceNode) : 0);
  const sy = sourceY + (sourceIsSector ? getBuildingHeight(sourceNode) : 0);
  const tx = targetX + (targetIsSector ? getBuildingHeight(targetNode) : 0);
  const ty = targetY + (targetIsSector ? getBuildingHeight(targetNode) : 0);

  const getSmartEdgeResponse = createGridPath(sx, sy, tx, ty, pathfindingNodes);
  
  let path, labelX, labelY;
  if (getSmartEdgeResponse) {
    path = getSmartEdgeResponse.svgPathString;
    labelX = getSmartEdgeResponse.edgeCenterX;
    labelY = getSmartEdgeResponse.edgeCenterY;
  } else {
    const [smoothPath, sx, sy] = getSmoothStepPath({
      sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition
    });
    path = smoothPath;
    labelX = sx;
    labelY = sy;
  }

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              backgroundColor: labelBgStyle?.fill || 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              border: `2px solid ${labelBgStyle?.stroke || '#1e293b'}`,
              color: labelStyle?.fill || '#0f172a',
              fontWeight: 'bold',
              fontSize: 14,
              fontFamily: 'sans-serif',
              zIndex: 999999
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const edgeTypes = {
  smart: CustomSmartEdge
};

function FlowMap({ playerId, onLogout }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [dayCount, setDayCount] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [baseId, setBaseId] = useState(null);
  const [playerBases, setPlayerBases] = useState([]);
  const [selectedBaseIndex, setSelectedBaseIndex] = useState(0);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [pendingNewSector, setPendingNewSector] = useState(null);
  const [pendingNewFicha, setPendingNewFicha] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  const onNodeMouseEnter = useCallback((event, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

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

      if (targetNode.type === 'ficha') {
        const newStatus = targetNode.data.status === 'ATIVO' || targetNode.data.status === 'OPERANDO' ? 'INATIVO' : 'ATIVO';
        
        atualizarStatusFicha(nodeId, newStatus);

        return nds.map((n) => {
          if (n.id === nodeId) {
            return { ...n, data: { ...n.data, status: newStatus } };
          }
          return n;
        });
      }

      const isSelfPowered = targetNode.data.distritos_energia && targetNode.data.distritos_energia.length > 0;
      const isSelfProvided = targetNode.data.setor_energia_provedor_id === targetNode.id;

      // Prevent toggling if the sector is currently without energy, unless it produces its own
      if (targetNode.data.status === 'SEM_ENERGIA' && !isSelfPowered && !isSelfProvided) {
        console.warn("Não é possível alterar manualmente o status de um setor sem energia dependente de outro.");
        return nds;
      }

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

  const loadData = useCallback(async (forceIndex) => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const data = await fetchPlayerData(playerId);
      
      const responseObj = Array.isArray(data) ? data[0] : data;

      if (responseObj && responseObj.bases && responseObj.bases.length > 0) {
        setPlayerBases(responseObj.bases);
        
        const indexToUse = forceIndex !== undefined ? forceIndex : selectedBaseIndex;
        const safeIndex = indexToUse < responseObj.bases.length ? indexToUse : 0;
        
        if (safeIndex !== selectedBaseIndex) {
          setSelectedBaseIndex(safeIndex);
        }
        
        const baseToLoad = responseObj.bases[safeIndex];
        setBaseId(baseToLoad.id); // store baseId

        let globalProcessos = [];
        try {
          const procRes = await listarTodosProcessosBase(baseToLoad.id);
          if (procRes && procRes.processos) {
            globalProcessos = procRes.processos;
          }
        } catch(e) { console.error("Erro ao carregar processos:", e); }

        const setores = baseToLoad.setores || [];
        const estradas = baseToLoad.estradas || [];
        
        const playerInfo = {
          id: responseObj.id,
          nome: responseObj.nome,
          baseId: baseToLoad.id
        };
        
        const oldLayoutMap = [
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

        // Maps original coordinates to spaced-out coordinates to allow for 3D extrusion gaps
        const mapX = (x) => {
          const map = { '-540': -580, '-270': -290, '0': 0, '270': 290, '440': 480, '710': 770, '860': 920, '1080': 1160, '1200': 1300, '1320': 1440 };
          return map[x] !== undefined ? map[x] : x;
        };
        const mapY = (y) => {
          const map = { '-220': -240, '0': 0, '150': 170, '220': 240, '390': 430, '420': 460, '560': 620, '730': 810 };
          return map[y] !== undefined ? map[y] : y;
        };

        const layoutMap = oldLayoutMap.map(l => ({
          ...l,
          oldX: l.x,
          oldY: l.y,
          x: mapX(l.x),
          y: mapY(l.y)
        }));

        // Dynamically append a massive grid around the edges to ensure infinite expansion
        const gap = 40;
        const eWidth = 250;
        const eHeight = 150;
        
        // Add 500 extra slots around the core area
        for(let r = -6; r <= 10; r++) {
            for(let c = -6; c <= 10; c++) {
               const bx = c * (eWidth + gap);
               const by = r * (eHeight + gap);
               
               // Precise overlap check against all handcrafted blocks
               let overlaps = false;
               for (let hl of layoutMap) {
                   // A gap of 10 is used for collision detection to allow standard gaps without triggering false positives
                   if (bx < hl.x + hl.width + 10 && bx + eWidth > hl.x - 10 &&
                       by < hl.y + hl.height + 10 && by + eHeight > hl.y - 10) {
                       overlaps = true;
                       break;
                   }
               }
               
               if (!overlaps) {
                   layoutMap.push({ x: bx, y: by, width: eWidth, height: eHeight });
               }
            }
        }

        const initializedNodes = [];
        const usedLayoutIndices = new Set();
        const occupiedLayouts = [];

        // Combine sectors and fichas for node rendering
        const combinedNodesData = [
          ...setores.map(s => ({ ...s, _nodeType: 'sector' })),
          ...(baseToLoad.fichas || []).map(f => ({ ...f, _nodeType: 'ficha' }))
        ];

        // 1. Process all existing structures (sectors and fichas)
        combinedNodesData.forEach((nodeData) => {
          let layoutIndex = layoutMap.findIndex(l => {
             if (!nodeData.posicao) return false;
             const px = Math.round(nodeData.posicao.x);
             const py = Math.round(nodeData.posicao.y);
             return (l.x === px && l.y === py) || (l.oldX === px && l.oldY === py);
          });
          
          if (layoutIndex === -1) {
            layoutIndex = layoutMap.findIndex((_, i) => !usedLayoutIndices.has(i));
          }
          
          if (layoutIndex !== -1) {
            usedLayoutIndices.add(layoutIndex);
            const layout = layoutMap[layoutIndex];
            occupiedLayouts.push(layout);

            initializedNodes.push({
              id: nodeData.id,
              type: nodeData._nodeType,
              position: { x: layout.x, y: layout.y },
              width: layout.width,
              height: layout.height,
              measured: { width: layout.width, height: layout.height },
              zIndex: 1000 + Math.round(layout.x + layout.y),
              data: {
                ...nodeData,
                width: layout.width,
                height: layout.height,
                playerInfo: nodeData.id.includes('SET_CENTRO') ? playerInfo : null,
                processos_ativos_count: globalProcessos.filter(p => p.setor?.id === nodeData.id && p.status_processo !== 'CONCLUIDO').length,
                onToggleTrouble: () => handleToggleTrouble(nodeData.id),
                isEmpty: false
              }
            });
          }
        });

        // 2. Generate adjacent empty lots
        // A layout is adjacent if its bounds are within 60px of any occupied layout
        const isAdjacent = (l1, l2) => {
           const gapTolerance = 60;
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
                width: layout.width,
                height: layout.height,
                measured: { width: layout.width, height: layout.height },
                zIndex: 0, // Ensure empty spots stay at the back
                data: {
                  width: layout.width,
                  height: layout.height,
                  isEmpty: true,
                  layoutX: layout.x,
                  layoutY: layout.y,
                  onCreateClick: () => setPendingNewSector({ x: layout.x, y: layout.y }),
                    onCreateFichaClick: () => setPendingNewFicha({ x: layout.x, y: layout.y })
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
                    width: fl.width,
                    height: fl.height,
                    measured: { width: fl.width, height: fl.height },
                    zIndex: 0,
                    data: {
                      width: fl.width,
                      height: fl.height,
                      isEmpty: true,
                      layoutX: fl.x,
                      layoutY: fl.y,
                      onCreateClick: () => setPendingNewSector({ x: fl.x, y: fl.y }),
                        onCreateFichaClick: () => setPendingNewFicha({ x: fl.x, y: fl.y })
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
  }, [handleToggleTrouble, setNodes, setEdges, playerId, selectedBaseIndex]);

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
      
      const processedIds = new Set();
      
      for (const edge of edgesToDelete) {
        const actualId = edge.id.replace('-outline', '');
        if (processedIds.has(actualId)) continue;
        processedIds.add(actualId);

        const res = await deletarEstrada(actualId);
        if (res && res.success) {
          console.log('Estrada desconectada:', actualId);
        } else {
          console.error('Falha ao desconectar estrada', actualId);
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

  const currentEdges = useMemo(() => {
    return edges.flatMap(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const isTrouble = sourceNode?.data?.status !== 'OPERANDO';
      const isHovered = edge.id === hoveredEdgeId;
      
      const baseEdge = {
        ...edge,
        type: 'smart',
        animated: !isTrouble,
      };

      const outline = {
        ...baseEdge,
        id: `${edge.id}-outline`,
        zIndex: isHovered ? 99998 : 0,
        style: {
          ...edge.style,
          stroke: isTrouble ? '#991b1b' : '#94a3b8', // Borda mais escura (vermelho escuro se em problema, senão cinza)
          strokeWidth: isHovered ? 14 : 10,
          cursor: 'pointer'
        }
      };

      const inline = {
        ...baseEdge,
        id: edge.id, // Mantém o ID original para os eventos
        label: isHovered ? edge.label : undefined,
        zIndex: isHovered ? 99999 : 1,
        style: {
          ...edge.style,
          stroke: isTrouble ? '#ef4444' : '#ffffff', // Interior branco parecendo rua de mapa (ou vermelho se problema)
          strokeWidth: isHovered ? 8 : 6,
          cursor: 'pointer'
        },
        labelBgPadding: [12, 6],
        labelBgBorderRadius: 6,
        labelBgStyle: { fill: '#ffffff', fillOpacity: 1, stroke: '#1e293b', strokeWidth: 2 },
        labelStyle: { fill: '#0f172a', fontWeight: 'bold', fontSize: 14, fontFamily: 'sans-serif' },
      };

      return [outline, inline];
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
      <HUD 
        dayCount={dayCount} 
        baseId={baseId} 
        onTimeSkipComplete={onTimeSkipComplete} 
        onLogout={onLogout} 
        playerId={playerId} 
        playerBases={playerBases}
        selectedBaseIndex={selectedBaseIndex}
        onSelectBase={(index) => {
          setSelectedBaseIndex(index);
          loadData(index);
        }}
        nodes={nodes}
      />
      
      <DetailsPanel 
        baseId={baseId}
        node={selectedNode} 
        providerNode={nodes.find(n => n.id === selectedNode?.data?.setor_energia_provedor_id)}
        onClose={() => setSelectedNodeId(null)} 
        onToggleTrouble={handleToggleTrouble}
        nodes={nodes}
        edges={edges}
      />

      <CursorTracker hoveredNodeId={hoveredNodeId} />

      <ReactFlow
        nodes={nodes}
        edges={currentEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneClick={onPaneClick}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        style={{ backgroundColor: '#8fa080' }}
        nodesDraggable={false}
        connectionMode="loose"
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
        {pendingNewFicha && (
          <CreateFichaModal 
            baseId={baseId}
            defaultX={pendingNewFicha.x}
            defaultY={pendingNewFicha.y}
            onClose={() => setPendingNewFicha(null)}
          />
        )}

    </div>
  );
}
const AnimatedCityBackground = () => {
  const blocks = [
    { type: 'red', x: 50, y: 150 },
    { type: 'gray', x: 250, y: 300 },
    { type: 'red', x: 100, y: 550 },
    { type: 'red', x: 450, y: 200 },
    { type: 'gray', x: 600, y: 100 },
    { type: 'red', x: 650, y: 600 },
    { type: 'gray', x: 800, y: 350 },
    { type: 'red', x: 950, y: 200 },
    { type: 'red', x: 1100, y: 500 },
    { type: 'gray', x: 1300, y: 400 },
    { type: 'red', x: 1450, y: 100 },
    { type: 'red', x: 1600, y: 650 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden bg-black z-0 pointer-events-none opacity-40">
       <style>{`
         @keyframes scroll-city {
           0% { transform: translateX(0); }
           100% { transform: translateX(-1800px); }
         }
         .city-scroller {
           display: flex;
           width: 3600px;
           animation: scroll-city 35s linear infinite;
         }
         .city-red-front { background-color: #ff194b; border: 6px solid black; position: absolute; inset: 0; z-index: 10; }
         .city-red-right { background-color: #800015; border: 6px solid black; border-left: 0; position: absolute; top: 0; left: 100%; width: 50px; height: 100%; transform: skewY(45deg); transform-origin: top left; z-index: 0; }
         .city-red-bottom { background-color: #b30026; border: 6px solid black; border-top: 0; position: absolute; top: 100%; left: 0; width: 100%; height: 50px; transform: skewX(45deg); transform-origin: top left; z-index: 0; }
         
         .city-gray-front { background-color: #708066; border: 6px solid black; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10; }
         .city-gray-plus { color: white; font-weight: bold; font-size: 3rem; opacity: 0.3; }
       `}</style>
       <div className="city-scroller h-full relative">
         {[1, 2].map((group) => (
           <div key={`group-${group}`} className="relative w-[1800px] h-full shrink-0">
             {blocks.map((b, i) => (
               <div key={`b-${group}-${i}`} className="absolute" style={{ left: b.x, top: b.y, width: 180, height: 120, zIndex: b.y }}>
                 {b.type === 'red' ? (
                   <>
                     <div className="city-red-right" />
                     <div className="city-red-bottom" />
                     <div className="city-red-front" />
                   </>
                 ) : (
                   <div className="city-gray-front">
                     <span className="city-gray-plus">+</span>
                   </div>
                 )}
               </div>
             ))}
           </div>
         ))}
       </div>
    </div>
  );
};

export default function App() {
  const [playerId, setPlayerId] = useState(() => {
    try {
      // Migrate old format if exists
      const oldId = localStorage.getItem('rpg_player_id');
      if (oldId) {
        localStorage.removeItem('rpg_player_id');
        localStorage.setItem('rpg_player_session', JSON.stringify({
          id: oldId,
          date: new Date().toLocaleDateString()
        }));
        return oldId;
      }

      const saved = localStorage.getItem('rpg_player_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toLocaleDateString();
        
        // Se a data salva for hoje, mantém o login. Caso contrário, expira (exige login de novo no dia seguinte)
        if (parsed.date === today) {
          return parsed.id;
        } else {
          localStorage.removeItem('rpg_player_session');
        }
      }
    } catch (e) {
      console.error("Erro ao ler cache do jogador", e);
    }
    return null;
  });

  if (!playerId) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center font-sans relative">
        <AnimatedCityBackground />
        <div className="bg-slate-900 border-[6px] border-slate-800 p-10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-md text-center relative z-10">
          <h1 className="text-3xl font-bold tracking-widest text-white mb-2 drop-shadow-md">Gerenciador de recurso</h1>
          <h2 className="text-xl font-bold tracking-widest text-sky-400 mb-8 drop-shadow-md">V2.4</h2>
          
          <div className="text-left">
            <label className="block text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
              Selecione o Comandante
            </label>
            <select 
              className="w-full bg-slate-800 border-2 border-slate-700 text-white p-4 rounded-lg outline-none focus:border-sky-500 mb-2 text-lg appearance-none cursor-pointer"
              onChange={(e) => {
                if (e.target.value) {
                  localStorage.setItem('rpg_player_session', JSON.stringify({
                    id: e.target.value,
                    date: new Date().toLocaleDateString()
                  }));
                  setPlayerId(e.target.value);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Escolha um perfil...</option>
              <option value="A26-I99">A26-I99 - Samuel</option>
              <option value="C1214-B8">C1214-B8 - Ruan</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <FlowMap 
        playerId={playerId} 
        onLogout={() => {
          localStorage.removeItem('rpg_player_session');
          setPlayerId(null);
        }} 
      />
    </ReactFlowProvider>
  );
}
