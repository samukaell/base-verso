import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Package, LogOut, Globe, FlaskConical, Boxes, Battery, BatteryLow, BatteryMedium, BatteryFull, Info } from 'lucide-react';
import TimeSkipWidget from './TimeSkipWidget';
import InventoryModal from './InventoryModal';
import CreateSectorModal from './CreateSectorModal';
import CreateMaterialModal from './CreateMaterialModal';
import CreateRecipeModal from './CreateRecipeModal';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function HUD({ baseId, onTimeSkipComplete, onLogout, playerId, playerBases = [], selectedBaseIndex = 0, onSelectBase, nodes = [] }) {
  const [showInventory, setShowInventory] = useState(false);
  const [showCreateSector, setShowCreateSector] = useState(false);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [showEnergyDetails, setShowEnergyDetails] = useState(false);
  
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
    return str.replace(/BASE DE ARR(\s*-)?\s*/i, 'Base ').trim();
  };

  // Cálculo de Energia Global da Base
  const { totalCapacity, totalRemaining, totalConsumed, consumers } = useMemo(() => {
    let capacity = 0;
    let consumed = 0;
    const consList = [];

    (nodes || []).forEach(n => {
      if (n.data?.isEmpty) return;
      
      // Sum production (usually only sectors)
      const prod = Number(n.data.producao_kwh_hora) || 0;
      capacity += prod;
      
      // If it's a Ficha, it consumes energy directly
      if (n.type === 'ficha') {
        const fichaAtiva = n.data.status === 'OPERANDO' || n.data.status === 'ATIVO';
        const req = Number(n.data.energia_requerida_kwh || 0);
        if (fichaAtiva && req > 0) {
          consumed += req;
          consList.push({
            id: n.id,
            nome_fabrica: n.data.nome || 'Defesa',
            setor: 'Base Central (Ficha)',
            req
          });
        }
      }

      // If it's a sector, check its fabricas
      if (n.data?.fabricas && Array.isArray(n.data.fabricas)) {
        n.data.fabricas.forEach(fab => {
          const req = Number(fab.energia_requerida_kwh || fab.energia_requerida || 0);
          if (req > 0) {
            consumed += req;
            consList.push({
              id: fab.id,
              nome_fabrica: fab.nome_fabrica || fab.nome || 'Fábrica',
              setor: n.data.nome || 'Setor',
              req
            });
          }
        });
      }
    });

    const remaining = Math.max(0, capacity - consumed);
    return { totalCapacity: capacity, totalRemaining: remaining, totalConsumed: consumed, consumers: consList };
  }, [nodes]);

  const pctRemaining = totalCapacity > 0 ? Math.max(0, Math.min(100, (totalRemaining / totalCapacity) * 100)) : 0;
  
  const getBatteryIcon = () => {
    if (totalCapacity === 0) return null;
    if (pctRemaining >= 75) return <BatteryFull className="w-8 h-8 text-emerald-400" />;
    if (pctRemaining >= 25) return <BatteryMedium className="w-8 h-8 text-amber-400" />;
    if (pctRemaining > 0) return <BatteryLow className="w-8 h-8 text-orange-500" />;
    return <Battery className="w-8 h-8 text-red-500" />;
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

        {/* Bateria Global da Base (Ícones) */}
        {totalCapacity > 0 && (
          <div 
            className="flex items-center mt-2 relative cursor-help w-fit"
            onMouseEnter={() => setShowEnergyDetails(true)}
            onMouseLeave={() => setShowEnergyDetails(false)}
          >
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2 rounded-xl shadow-lg flex items-center gap-3 pointer-events-auto hover:bg-slate-800/90 transition-all">
              {getBatteryIcon()}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Rede Elétrica</span>
                <span className="text-white font-extrabold">{pctRemaining.toFixed(1)}%</span>
              </div>
            </div>

            {/* Tooltip de Detalhes da Energia */}
            <div 
              className={cn(
                "absolute top-0 left-full ml-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] p-3 w-64 transition-all duration-300 origin-left z-50 pointer-events-none",
                showEnergyDetails ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}
            >
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                Fornecimento de Energia
              </h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex justify-between items-center text-[10px] bg-slate-800/50 p-1.5 rounded mb-2 border border-slate-700/50">
                  <span className="text-slate-400">Total Produzido:</span>
                  <span className="text-emerald-400 font-bold">{totalCapacity.toFixed(0)} kWh</span>
                </div>
                <div className="flex justify-between items-center text-[10px] bg-slate-800/50 p-1.5 rounded mb-2 border border-slate-700/50">
                  <span className="text-slate-400">Total Consumido:</span>
                  <span className="text-amber-400 font-bold">{totalConsumed.toFixed(0)} kWh</span>
                </div>

                <div className="text-xs text-slate-500 font-bold uppercase mt-3 mb-2 border-b border-slate-800 pb-1">Instalações Consumidoras</div>
                
                {consumers.length === 0 ? (
                  <div className="text-slate-500 text-[10px] italic text-center py-2">Nenhuma fábrica consumindo energia</div>
                ) : (
                  consumers.map(cons => (
                    <div key={cons.id} className="flex flex-col gap-1 text-[10px] pb-2 border-b border-slate-800 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center font-bold text-slate-200">
                        <span className="truncate max-w-[140px] text-sky-400">{cons.nome_fabrica}</span>
                        <span className="text-amber-400">{cons.req} kWh</span>
                      </div>
                      <div className="text-slate-500 flex items-center gap-1">
                        <span>Local:</span>
                        <span className="text-slate-400 truncate">{cons.setor}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
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
