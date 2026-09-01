import React, { useState } from 'react';
import { Activity, Package, Plus } from 'lucide-react';
import TimeSkipWidget from './TimeSkipWidget';
import InventoryModal from './InventoryModal';
import CreateSectorModal from './CreateSectorModal';
import CreateMaterialModal from './CreateMaterialModal';
import CreateRecipeModal from './CreateRecipeModal';

export default function HUD({ dayCount = 1, baseId, onTimeSkipComplete, onLogout, playerId }) {
  const [showInventory, setShowInventory] = useState(false);
  const [showCreateSector, setShowCreateSector] = useState(false);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);

  return (
    <>
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-4 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-lg pointer-events-auto w-72">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-400" />
              <h1 className="text-lg font-bold text-slate-100">Controle de Base</h1>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="text-xs bg-red-900/50 hover:bg-red-800 text-red-200 px-2 py-1 rounded border border-red-800/50 transition-colors"
                title="Sair"
              >
                Sair
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
              <span className="text-slate-400">Tempo Atual</span>
              <span className="text-slate-200 font-bold font-mono">Dia {dayCount}</span>
            </div>

            <TimeSkipWidget baseId={baseId} onTimeSkipComplete={onTimeSkipComplete} />
          </div>
        </div>

        {/* Botões extras do HUD */}
        <div className="flex flex-col gap-2">
          {/* Botão do Inventário */}
          <button 
            onClick={() => setShowInventory(true)}
            className="pointer-events-auto flex items-center justify-between w-72 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-lg hover:bg-slate-800/90 hover:border-emerald-500/50 transition-all group"
            title="Abrir Inventário Global"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-100 leading-tight">Estoque Global</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Ver todos os itens</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </button>

          {/* Botão de Criar Novo Material */}
          <button 
            onClick={() => setShowCreateMaterial(true)}
            className="pointer-events-auto flex items-center justify-between w-72 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-lg hover:bg-slate-800/90 hover:border-fuchsia-500/50 transition-all group"
            title="Cadastrar Novo Material no Sistema"
          >
            <div className="flex items-center gap-3">
              <div className="bg-fuchsia-500/10 p-2 rounded-lg border border-fuchsia-500/20 group-hover:bg-fuchsia-500/20 group-hover:border-fuchsia-500/40 transition-colors">
                <Plus className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-100 leading-tight">Criar Material</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Adicionar ao banco de dados</span>
              </div>
            </div>
          </button>

          {/* Botão de Criar Nova Receita */}
          <button 
            onClick={() => setShowCreateRecipe(true)}
            className="pointer-events-auto flex items-center justify-between w-72 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-lg hover:bg-slate-800/90 hover:border-purple-500/50 transition-all group"
            title="Cadastrar Nova Receita/Processo no Sistema"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                <Plus className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-100 leading-tight">Criar Processo</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Formular nova receita</span>
              </div>
            </div>
          </button>
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
