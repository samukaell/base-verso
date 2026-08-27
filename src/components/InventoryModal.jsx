import React, { useState, useEffect } from 'react';
import { X, Package, Box, RefreshCw, Layers } from 'lucide-react';
import { fetchEstoquePorJogador } from '../request/request';

export default function InventoryModal({ onClose, playerId = 'A26-I99' }) {
  const [estoque, setEstoque] = useState({ manufaturados: [], materias_primas: [] });
  const [isLoading, setIsLoading] = useState(true);

  const loadEstoque = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEstoquePorJogador(playerId);
      
      let newEstoque = { manufaturados: [], materias_primas: [] };
      if (data && typeof data === 'object') {
        if (Array.isArray(data.manufaturados)) newEstoque.manufaturados = data.manufaturados;
        if (Array.isArray(data.materias_primas)) newEstoque.materias_primas = data.materias_primas;
      }
      
      setEstoque(newEstoque);
    } catch (err) {
      console.error("Erro ao processar estoque:", err);
      setEstoque({ manufaturados: [], materias_primas: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEstoque();
  }, [playerId]);

  const totalItems = estoque.manufaturados.length + estoque.materias_primas.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="font-bold text-lg text-slate-100 leading-tight">Inventário Global</h2>
              <span className="text-xs text-slate-400">ID Jogador: {playerId}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={loadEstoque} disabled={isLoading} className="text-slate-400 hover:text-emerald-400 transition-colors p-1 disabled:opacity-50">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-mono text-sm tracking-widest">Sincronizando inventário...</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhum item encontrado no inventário.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Matérias Primas */}
              {estoque.materias_primas.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                    <Box className="w-4 h-4" /> Matérias Primas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {estoque.materias_primas.map((item, idx) => {
                      const isItemUnavailable = item.status_disponivel === false;
                      return (
                      <div key={idx} className={`border rounded-lg p-4 flex flex-col gap-2 transition-colors ${isItemUnavailable ? 'bg-red-950/20 border-red-900/50 hover:bg-red-950/30' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg border ${isItemUnavailable ? 'bg-red-950/50 border-red-800' : 'bg-slate-900 border-amber-900/50'}`}>
                            <Box className={`w-5 h-5 ${isItemUnavailable ? 'text-red-500' : 'text-amber-500'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-bold text-sm leading-tight ${isItemUnavailable ? 'text-red-400' : 'text-slate-200'}`}>{item.nome_material}</h4>
                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${isItemUnavailable ? 'bg-red-950/50 text-red-400 border-red-900/50' : 'bg-slate-800 text-slate-400 border-slate-700/50'}`}>{item.categoria} - TIER {item.nivel_tier}</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono font-bold text-lg block leading-none ${isItemUnavailable ? 'text-red-500' : 'text-amber-400'}`}>{item.quantidade_total_ton}</span>
                            <span className={`text-[10px] uppercase ${isItemUnavailable ? 'text-red-400/50' : 'text-slate-500'}`}>Ton</span>
                          </div>
                        </div>
                        <p className={`text-xs border-t pt-2 mt-1 line-clamp-1 ${isItemUnavailable ? 'text-red-300/70 border-red-900/50' : 'text-slate-400 border-slate-700/50'}`} title={item.descricao}>{item.descricao}</p>
                        
                        {item.localizacoes && item.localizacoes.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <span className={`text-[10px] uppercase font-bold block ${isItemUnavailable ? 'text-red-400/70' : 'text-slate-500'}`}>Localizações:</span>
                            {item.localizacoes.map((loc, lIdx) => {
                              const isLocUnavailable = loc.status_disponivel === false;
                              return (
                              <div key={lIdx} className={`p-2 rounded border flex flex-col gap-0.5 ${isLocUnavailable ? 'bg-red-950/40 border-red-800/60' : 'bg-slate-900/50 border-slate-700/50'}`}>
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs font-bold truncate pr-2 font-mono ${isLocUnavailable ? 'text-red-400' : 'text-slate-300'}`} title={loc.base_id}>{loc.base_id}</span>
                                  <span className={`text-[10px] font-mono font-bold whitespace-nowrap ${isLocUnavailable ? 'text-red-500' : 'text-amber-400'}`}>{loc.quantidade_ton} Ton</span>
                                </div>
                                <span className={`text-[10px] truncate ${isLocUnavailable ? 'text-red-300/80' : 'text-slate-400'}`} title={`${loc.nome_setor} • ${loc.nome_armazem}`}>
                                  {loc.nome_setor} <span className="opacity-50 mx-1">•</span> {loc.nome_armazem}
                                </span>
                                {isLocUnavailable && (
                                  <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-950/50 px-1 py-0.5 rounded border border-red-900/50 inline-block self-start">
                                    Bloqueado: {loc.status_setor || 'Setor Inativo'}
                                  </span>
                                )}
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Manufaturados */}
              {estoque.manufaturados.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2 mt-4">
                    <Layers className="w-4 h-4" /> Manufaturados & Componentes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {estoque.manufaturados.map((item, idx) => {
                      const isItemUnavailable = item.status_disponivel === false;
                      return (
                      <div key={idx} className={`border rounded-lg p-4 flex flex-col gap-2 transition-colors ${isItemUnavailable ? 'bg-red-950/20 border-red-900/50 hover:bg-red-950/30' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg border ${isItemUnavailable ? 'bg-red-950/50 border-red-800' : 'bg-slate-900 border-purple-900/50'}`}>
                            <Layers className={`w-5 h-5 ${isItemUnavailable ? 'text-red-500' : 'text-purple-400'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-bold text-sm leading-tight ${isItemUnavailable ? 'text-red-400' : 'text-slate-200'}`}>{item.nome_material}</h4>
                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${isItemUnavailable ? 'bg-red-950/50 text-red-400 border-red-900/50' : 'bg-slate-800 text-slate-400 border-slate-700/50'}`}>{item.categoria} - TIER {item.nivel_tier}</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono font-bold text-lg block leading-none ${isItemUnavailable ? 'text-red-500' : 'text-emerald-400'}`}>{item.quantidade_total_ton}</span>
                            <span className={`text-[10px] uppercase ${isItemUnavailable ? 'text-red-400/50' : 'text-slate-500'}`}>Ton</span>
                          </div>
                        </div>
                        <p className={`text-xs border-t pt-2 mt-1 line-clamp-1 ${isItemUnavailable ? 'text-red-300/70 border-red-900/50' : 'text-slate-400 border-slate-700/50'}`} title={item.descricao}>{item.descricao}</p>
                        
                        {item.localizacoes && item.localizacoes.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <span className={`text-[10px] uppercase font-bold block ${isItemUnavailable ? 'text-red-400/70' : 'text-slate-500'}`}>Localizações:</span>
                            {item.localizacoes.map((loc, lIdx) => {
                              const isLocUnavailable = loc.status_disponivel === false;
                              return (
                              <div key={lIdx} className={`p-2 rounded border flex flex-col gap-0.5 ${isLocUnavailable ? 'bg-red-950/40 border-red-800/60' : 'bg-slate-900/50 border-slate-700/50'}`}>
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs font-bold truncate pr-2 font-mono ${isLocUnavailable ? 'text-red-400' : 'text-slate-300'}`} title={loc.base_id}>{loc.base_id}</span>
                                  <span className={`text-[10px] font-mono font-bold whitespace-nowrap ${isLocUnavailable ? 'text-red-500' : 'text-emerald-400'}`}>{loc.quantidade_ton} Ton</span>
                                </div>
                                <span className={`text-[10px] truncate ${isLocUnavailable ? 'text-red-300/80' : 'text-slate-400'}`} title={`${loc.nome_setor} • ${loc.nome_armazem}`}>
                                  {loc.nome_setor} <span className="opacity-50 mx-1">•</span> {loc.nome_armazem}
                                </span>
                                {isLocUnavailable && (
                                  <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-950/50 px-1 py-0.5 rounded border border-red-900/50 inline-block self-start">
                                    Bloqueado: {loc.status_setor || 'Setor Inativo'}
                                  </span>
                                )}
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
