import React, { useState, useEffect } from 'react';
import { Activity, Package, LogOut, Globe, FlaskConical, Boxes } from 'lucide-react';
import TimeSkipWidget from './TimeSkipWidget';
import InventoryModal from './InventoryModal';
import CreateSectorModal from './CreateSectorModal';
import CreateMaterialModal from './CreateMaterialModal';
import CreateRecipeModal from './CreateRecipeModal';

export default function HUD({ dayCount = 1, baseId, onTimeSkipComplete, onLogout, playerId, playerBases = [], selectedBaseIndex = 0, onSelectBase }) {
  const [showInventory, setShowInventory] = useState(false);
  const [showCreateSector, setShowCreateSector] = useState(false);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  
  const [mundoData, setMundoData] = useState(null);

  useEffect(() => {
    // Definir ID do mundo baseado no jogador
    const mundoId = playerId === 'C1214-B8' ? 'Terra-C1214-B8' : 'MUNDO-01';

    // Fetch world data
    import('../request/request').then(({ obterDetalhesMundo }) => {
      obterDetalhesMundo(mundoId).then(res => {
        if (res && res.success && res.mundo) {
          setMundoData(res.mundo);
        }
      });
    });
  }, [playerId]);

  const formatName = (str) => {
    if (!str) return "";
    return str.replace(/BASE(\s*-)?\s*/i, 'Base ').trim();
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 pointer-events-none w-72">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-lg pointer-events-auto shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-sky-400" />
            <h1 className="text-base font-bold text-slate-100">Controle de Base</h1>
          </div>
          
          <div className="space-y-3">
            {mundoData && (
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{formatName(mundoData.nome)}</span>
                </div>
                <div className="text-[9px] text-slate-400 leading-tight line-clamp-2" title={mundoData.descricao}>
                  {mundoData.descricao}
                </div>
                <div className="flex justify-between items-center text-[10px] mt-0.5 border-t border-slate-700/50 pt-1.5">
                  <span className="text-slate-400">Tempo Atual</span>
                  <span className="text-slate-200 font-mono font-bold">
                    {new Date(mundoData.tempo_atual).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-500">
                  <span>População: {mundoData.total_jogadores}</span>
                  <span>Bases: {mundoData.total_bases}</span>
                  <span className="text-emerald-500/70">Fator: {mundoData.fator_aceleracao}x</span>
                </div>
              </div>
            )}
            
            {playerBases.length > 1 && (
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Selecionar Base</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded text-xs outline-none focus:border-amber-500 cursor-pointer"
                  value={selectedBaseIndex}
                  onChange={(e) => onSelectBase && onSelectBase(Number(e.target.value))}
                >
                  {playerBases.map((base, idx) => (
                    <option key={base.id} value={idx}>
                      {formatName(base.id)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <TimeSkipWidget baseId={baseId} playerId={playerId} onTimeSkipComplete={onTimeSkipComplete} />
          </div>
        </div>

        {/* Botões extras do HUD - Expansíveis no hover */}
        <div className="flex flex-row gap-2 pointer-events-auto shrink-0 w-full">
          {/* Botão do Inventário */}
          <button 
            onClick={() => setShowInventory(true)}
            className="flex items-center justify-start bg-slate-900/80 backdrop-blur-md border border-slate-700 h-10 px-2.5 rounded-xl shadow-lg hover:bg-slate-800/90 hover:border-emerald-500/50 transition-all duration-300 group overflow-hidden w-10 hover:w-36 shrink-0 relative"
          >
            <Package className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="absolute top-1.5 left-6 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="ml-3 font-bold text-slate-100 text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Estoque Global
            </span>
          </button>

          {/* Botão de Criar Novo Material */}
          <button 
            onClick={() => setShowCreateMaterial(true)}
            className="flex items-center justify-start bg-slate-900/80 backdrop-blur-md border border-slate-700 h-10 px-2.5 rounded-xl shadow-lg hover:bg-slate-800/90 hover:border-fuchsia-500/50 transition-all duration-300 group overflow-hidden w-10 hover:w-36 shrink-0"
          >
            <Boxes className="w-5 h-5 text-fuchsia-400 shrink-0" />
            <span className="ml-3 font-bold text-slate-100 text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Criar Material
            </span>
          </button>

          {/* Botão de Criar Nova Receita */}
          <button 
            onClick={() => setShowCreateRecipe(true)}
            className="flex items-center justify-start bg-slate-900/80 backdrop-blur-md border border-slate-700 h-10 px-2.5 rounded-xl shadow-lg hover:bg-slate-800/90 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden w-10 hover:w-36 shrink-0"
          >
            <FlaskConical className="w-5 h-5 text-purple-400 shrink-0" />
            <span className="ml-3 font-bold text-slate-100 text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Criar Processo
            </span>
          </button>

          {/* Botão Desconectar */}
          {onLogout ? (
            <button 
              onClick={onLogout}
              className="flex items-center justify-start bg-red-950/80 backdrop-blur-md border border-red-900/50 h-10 px-2.5 rounded-xl shadow-lg hover:bg-red-900/90 hover:border-red-500/50 transition-all duration-300 group overflow-hidden w-10 hover:w-32 shrink-0"
            >
              <LogOut className="w-5 h-5 text-red-400 shrink-0" />
              <span className="ml-3 font-bold text-red-100 text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Desconectar
              </span>
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {showInventory && (
        <InventoryModal onClose={() => setShowInventory(false)} playerId={playerId} />
      )}
      
      {showCreateSector && (
        <CreateSectorModal baseId={baseId} onClose={() => setShowCreateSector(false)} />
      )}

      {showCreateMaterial && (
        <CreateMaterialModal onClose={() => setShowCreateMaterial(false)} />
      )}

      {showCreateRecipe && (
        <CreateRecipeModal 
          baseId={baseId} 
          onClose={(shouldReload) => {
            setShowCreateRecipe(false);
            if (shouldReload) window.location.reload();
          }} 
        />
      )}
    </>
  );
}
