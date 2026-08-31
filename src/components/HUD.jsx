import React, { useState } from 'react';
import { Activity, Package, Plus } from 'lucide-react';
import TimeSkipWidget from './TimeSkipWidget';
import InventoryModal from './InventoryModal';
import CreateSectorModal from './CreateSectorModal';

export default function HUD({ dayCount = 1, baseId, onTimeSkipComplete }) {
  const [showInventory, setShowInventory] = useState(false);
  const [showCreateSector, setShowCreateSector] = useState(false);

  return (
    <>
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-4 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-lg pointer-events-auto w-72">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-bold text-slate-100">Controle de Base</h1>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
              <span className="text-slate-400">Tempo Atual</span>
              <span className="text-slate-200 font-bold font-mono">Dia {dayCount}</span>
            </div>

            <TimeSkipWidget baseId={baseId} onTimeSkipComplete={onTimeSkipComplete} />
          </div>
        </div>

        {/* Botão separado do Inventário, estilizado como parte do HUD */}
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

      </div>

      {showInventory && (
        <InventoryModal onClose={() => setShowInventory(false)} />
      )}
      
      {showCreateSector && (
        <CreateSectorModal baseId={baseId} onClose={() => setShowCreateSector(false)} />
      )}
    </>
  );
}
