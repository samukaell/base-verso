import React, { useState, useMemo } from 'react';
import { Truck, X, ArrowRight, Box } from 'lucide-react';
import { transferirEstoque } from '../request/request';

export default function TransferStockModal({
  isOpen,
  onClose,
  sourceArmazem,
  item,
  sourceSectorId,
  nodes,
  edges
}) {
  const [selectedDestinoId, setSelectedDestinoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Encontra todos os setores que têm caminho (direto ou indireto) a partir do sourceSectorId
  // Para simplificar, a regra de negócio do usuário costuma ser 'ter estradas', vamos achar qualquer setor alcançável via BFS
  const reachableSectorIds = useMemo(() => {
    if (!nodes || !edges || !sourceSectorId) return new Set();
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => {
      if (adj[e.source]) adj[e.source].push(e.target);
      if (adj[e.target]) adj[e.target].push(e.source); // Bidirecional
    });

    const visited = new Set();
    const queue = [sourceSectorId];
    visited.add(sourceSectorId);

    while(queue.length > 0) {
      const curr = queue.shift();
      if(adj[curr]) {
        for(let viz of adj[curr]) {
          if(!visited.has(viz)) {
            visited.add(viz);
            queue.push(viz);
          }
        }
      }
    }
    return visited;
  }, [nodes, edges, sourceSectorId]);

  // Lista todos os armazéns dos setores alcançáveis, exceto o de origem
  const availableDestinations = useMemo(() => {
    if (!nodes) return [];
    const list = [];
    nodes.forEach(node => {
      if (reachableSectorIds.has(node.id)) {
        const armazens = node.data?.distritos_armazenamento || [];
        armazens.forEach(arm => {
          if (arm.id !== sourceArmazem?.id) {
            // Calcula espaço restante
            const max = arm.capacidade_maxima_ton || 0;
            const rawRestante = typeof arm.espaco_restante_ton === 'number' 
              ? arm.espaco_restante_ton 
              : max - (arm.itens_armazenados?.reduce((acc, curr) => acc + (curr.quantidade_atual_ton || 0), 0) || 0);
            
            const restante = Math.max(0, rawRestante);

            list.push({
              id: arm.id,
              nome: arm.nome,
              setorNome: node.data.nome,
              restante
            });
          }
        });
      }
    });
    // Filtra apenas os que têm espaço e ordena por nome
    return list.filter(d => d.restante > 0).sort((a,b) => a.setorNome.localeCompare(b.setorNome));
  }, [nodes, reachableSectorIds, sourceArmazem]);

  if (!isOpen || !item || !sourceArmazem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDestinoId || quantidade <= 0) return;

    setIsSubmitting(true);
    const res = await transferirEstoque({
      armazemOrigemId: sourceArmazem.id,
      armazemDestinoId: selectedDestinoId,
      materialId: item.material_id || item.id, // fallback em caso da modelagem usar .id
      quantidadeTon: Number(quantidade)
    });

    if (res && res.success !== false) {
      window.location.reload();
    } else {
      alert("Erro ao transferir estoque: " + (res?.message || "Erro desconhecido"));
      setIsSubmitting(false);
    }
  };

  const currentDestino = availableDestinations.find(d => d.id === selectedDestinoId);
  const maxAllowed = currentDestino 
    ? Math.min(item.quantidade_atual_ton, currentDestino.restante) 
    : item.quantidade_atual_ton;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-900/80 rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.15)] w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-amber-900/50 bg-amber-950/30">
          <div className="flex items-center gap-2 text-amber-500">
            <Truck className="w-5 h-5" />
            <h2 className="font-bold text-lg text-slate-100">Logística de Transferência</h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Info do Item */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Box className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">{item.nome_material}</p>
                <p className="text-xs text-slate-400">Origem: {sourceArmazem.nome}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Disponível</p>
              <p className="text-sm font-mono text-emerald-400 font-bold">{item.quantidade_atual_ton} T</p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-slate-600" />
          </div>

          {/* Destino */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Armazém de Destino
            </label>
            {availableDestinations.length === 0 ? (
              <div className="text-sm text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                Nenhum armazém com espaço livre alcançável por rodovias.
              </div>
            ) : (
              <select
                value={selectedDestinoId}
                onChange={e => {
                  setSelectedDestinoId(e.target.value);
                  // Ajustar quantidade se estourar o novo limite
                  const novoDestino = availableDestinations.find(d => d.id === e.target.value);
                  if (novoDestino && quantidade > Math.min(item.quantidade_atual_ton, novoDestino.restante)) {
                    setQuantidade(Math.min(item.quantidade_atual_ton, novoDestino.restante));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                required
              >
                <option value="" disabled>Selecione um destino...</option>
                {availableDestinations.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.setorNome} - {d.nome} (Livre: {d.restante.toFixed(1)} T)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantidade */}
          {selectedDestinoId && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex justify-between">
                <span>Quantidade a Enviar (Ton)</span>
                <span className="text-amber-400">Máx: {maxAllowed.toFixed(1)} T</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                max={maxAllowed}
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono"
                required
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !selectedDestinoId || quantidade <= 0 || quantidade > maxAllowed}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Truck className="w-4 h-4" />
              {isSubmitting ? 'Enviando Comboio...' : 'Despachar Carga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
