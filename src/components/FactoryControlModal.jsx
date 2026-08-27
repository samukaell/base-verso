import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Activity, Cpu } from 'lucide-react';
import { iniciarLinhaProducao, pausarLinhaProducao } from '../request/request';

// Dummy list of recipes, you might fetch this from DB based on factory type
const RECEITAS_MOCK = [
  { id: 'rec-1', nome: 'Placas de Circuito', entrada: 'Silício', qtd_entrada: 4, saida: 'Circuitos', qtd_saida: 2 },
  { id: 'rec-2', nome: 'Baterias', entrada: 'Lítio', qtd_entrada: 3, saida: 'Baterias', qtd_saida: 1 },
  { id: 'rec-3', nome: 'Extração de Silício (Sem Entrada)', entrada: null, qtd_entrada: 0, saida: 'Silício', qtd_saida: 5, is_extracao: true }
];

export default function FactoryControlModal({ fabrica, onClose, onUpdate }) {
  const [isLooping, setIsLooping] = useState(fabrica.em_loop || false);
  const [selectedReceitaId, setSelectedReceitaId] = useState(fabrica.receita_id || RECEITAS_MOCK[0].id);
  const [isLoading, setIsLoading] = useState(false);

  const selectedReceita = RECEITAS_MOCK.find(r => r.id === selectedReceitaId) || RECEITAS_MOCK[0];

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isLooping) {
        await pausarLinhaProducao(fabrica.id);
        setIsLooping(false);
      } else {
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
              disabled={isLooping}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            >
              {RECEITAS_MOCK.map(r => (
                <option key={r.id} value={r.id}>{r.nome}</option>
              ))}
            </select>
            {isLooping && <p className="text-[10px] text-amber-400/80">Pause a linha para alterar a receita.</p>}
          </div>

          {/* Indicador Visual de Consumo */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3 h-3" /> Balanço por Ciclo (1 Hora)
            </h4>
            
            <div className="flex items-center gap-3 text-sm">
              {!selectedReceita.is_extracao && (
                <div className="flex-1 bg-red-950/30 border border-red-900/50 rounded p-2 text-center">
                  <span className="block text-red-400 font-bold mb-1">-{selectedReceita.qtd_entrada} Ton</span>
                  <span className="text-[10px] text-slate-400 uppercase">{selectedReceita.entrada}</span>
                </div>
              )}
              
              {!selectedReceita.is_extracao && (
                <div className="text-slate-600 font-bold">➔</div>
              )}

              <div className="flex-1 bg-emerald-950/30 border border-emerald-900/50 rounded p-2 text-center">
                <span className="block text-emerald-400 font-bold mb-1">+{selectedReceita.qtd_saida} Ton</span>
                <span className="text-[10px] text-slate-400 uppercase">{selectedReceita.saida}</span>
              </div>
            </div>
            {selectedReceita.is_extracao && (
              <p className="text-[10px] text-slate-500 text-center italic mt-2">
                Processo de extração não consome materiais.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/80">
          <button 
            onClick={handleToggle}
            disabled={isLoading}
            className={`w-full font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
              isLooping 
                ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20" 
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/20"
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="animate-pulse">Processando...</span>
            ) : isLooping ? (
              <>
                <Pause className="w-5 h-5" /> Pausar Linha
              </>
            ) : (
              <>
                <Play className="w-5 h-5" /> Iniciar Produção Contínua
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
