import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Activity, Cpu } from 'lucide-react';
import { iniciarLinhaProducao, pausarLinhaProducao, listarTodasReceitas, listarMateriaisBase } from '../request/request';

export default function FactoryControlModal({ baseId, fabrica, onClose, onUpdate }) {
  const [isLooping, setIsLooping] = useState(fabrica.em_loop || false);
  const [receitas, setReceitas] = useState([]);
  const [selectedReceitaId, setSelectedReceitaId] = useState(fabrica.receita_id || '');
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [recData, invData] = await Promise.all([
        listarTodasReceitas(),
        listarMateriaisBase(baseId)
      ]);
      
      const receitasLista = (recData && Array.isArray(recData.receitas)) ? recData.receitas : (Array.isArray(recData) ? recData : []);
      setReceitas(receitasLista);
      
      const invLista = (invData && Array.isArray(invData.materiais)) ? invData.materiais : (Array.isArray(invData) ? invData : []);
      setInventory(invLista);

      if (!selectedReceitaId && receitasLista.length > 0) {
        setSelectedReceitaId(receitasLista[0].id);
      }
      setIsLoading(false);
    }
    loadData();
  }, [baseId, selectedReceitaId]);

  const selectedReceita = receitas.find(r => r.id === selectedReceitaId);

  const checkHasSufficientStock = (materialId, amountNeeded) => {
    const invItem = inventory.find(i => i.material_id === materialId);
    if (!invItem) return false;
    return invItem.quantidade_total_ton >= amountNeeded;
  };

  const getMissingIngredients = () => {
    if (!selectedReceita || !selectedReceita.insumos_entrada) return [];
    return selectedReceita.insumos_entrada.filter(ing => !checkHasSufficientStock(ing.material_id, ing.quantidade_necessaria));
  };

  const missingIngredients = getMissingIngredients();
  const canStart = missingIngredients.length === 0;

  const handleToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isLooping) {
        await pausarLinhaProducao(fabrica.id);
        setIsLooping(false);
      } else {
        if (!canStart) {
          alert('Material insuficiente para iniciar a produção.');
          setIsLoading(false);
          return;
        }
        await iniciarLinhaProducao(fabrica.id, selectedReceitaId);
        setIsLooping(true);
      }
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="font-bold text-lg text-slate-100 leading-tight">{fabrica.nome_fabrica || 'Controle da Fábrica'}</h2>
              <span className="text-xs text-slate-400">{fabrica.tipo_fabrica}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Status Atual */}
          <div className={`p-3 rounded-lg border flex items-center justify-between ${isLooping ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
            <span className="text-sm font-bold text-slate-300">Status da Linha:</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${isLooping ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
              {isLooping ? 'OPERANDO (LOOP)' : 'DESATIVADA'}
            </span>
          </div>

          {/* Seletor de Receita */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita Ativa</label>
            <select 
              value={selectedReceitaId}
              onChange={(e) => setSelectedReceitaId(e.target.value)}
              disabled={isLooping || isLoading}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            >
              {receitas.map(r => (
                <option key={r.id} value={r.id}>{r.nome}</option>
              ))}
            </select>
            {isLooping && <p className="text-[10px] text-amber-400/80">Pause a linha para alterar a receita.</p>}
          </div>

          {/* Indicador Visual de Consumo */}
          {selectedReceita && (
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3 h-3" /> Balanço por Ciclo ({selectedReceita.tempo_ciclo_horas} Hora(s))
              </h4>
              
              <div className="flex flex-col gap-3 text-sm">
                {/* Ingredientes */}
                {selectedReceita.insumos_entrada && selectedReceita.insumos_entrada.length > 0 ? (
                  selectedReceita.insumos_entrada.map(ing => {
                    const hasStock = checkHasSufficientStock(ing.material_id, ing.quantidade_necessaria);
                    return (
                      <div key={ing.material_id} className={`flex-1 bg-slate-950/30 border ${hasStock ? 'border-red-900/50' : 'border-red-500 bg-red-950/50'} rounded p-2 text-center`}>
                        <span className={`block ${hasStock ? 'text-red-400' : 'text-red-500'} font-bold mb-1`}>
                          -{ing.quantidade_necessaria} Ton
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {ing.nome_material || ing.material_id}
                          {!hasStock && <span className="text-red-500 ml-1 font-bold">(Falta material na base)</span>}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-xs text-slate-500 italic">Sem insumos necessários</div>
                )}
                
                <div className="text-slate-600 font-bold self-center">➔</div>

                <div className="flex-1 bg-emerald-950/30 border border-emerald-900/50 rounded p-2 text-center">
                  <span className="block text-emerald-400 font-bold mb-1">
                    +{selectedReceita.produto_saida?.quantidade_saida || 0} Ton
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {selectedReceita.produto_saida?.nome_material || 'Material Produzido'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-800">
                <span className="text-slate-400">Energia Necessária:</span>
                <span className="text-yellow-400 font-bold">{selectedReceita.energia_requerida_kwh} kWh</span>
              </div>
            </div>
          )}

          {/* Botão de Ação */}
          <button 
            onClick={handleToggle}
            disabled={isLoading || (!isLooping && !canStart)}
            className={`w-full py-4 rounded-lg font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              ${(!isLooping && !canStart) ? 'bg-red-600/50 text-red-300 border border-red-500 cursor-not-allowed' : 
                isLooping 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
              }
            `}
          >
            {isLoading ? (
              <span className="animate-pulse">Aguarde...</span>
            ) : (!isLooping && !canStart) ? (
              <span>Falta Ingredientes</span>
            ) : isLooping ? (
              <><Pause className="w-5 h-5 fill-current" /> Pausar Produção</>
            ) : (
              <><Play className="w-5 h-5 fill-current" /> Iniciar Produção</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
