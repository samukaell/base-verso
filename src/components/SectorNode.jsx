import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle, Package, Zap, Beaker, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to merge tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const getTierIcon = (tier) => {
  switch (tier) {
    case 1: return <Zap className="w-4 h-4 text-emerald-400" />;
    case 2: return <Beaker className="w-4 h-4 text-blue-400" />;
    case 3: return <Package className="w-4 h-4 text-purple-400" />;
    default: return <Package className="w-4 h-4 text-slate-400" />;
  }
};

const getTierName = (tier) => {
  switch (tier) {
    case 1: return "Tier 1: Extração";
    case 2: return "Tier 2: Refino";
    case 3: return "Tier 3: P&D / Hangar";
    default: return "Setor Base";
  }
};

export default function SectorNode({ data, selected }) {
  const { 
    label, 
    slotsUsed = 0, 
    slotsMax = 4, 
    passives = [], 
    tier = 1, 
    trouble = false, 
    siloCurrent = 0, 
    siloMax = 0,
    onToggleTrouble
  } = data;

  const storagePercent = siloMax > 0 ? Math.min(100, Math.round((siloCurrent / siloMax) * 100)) : 0;

  return (
    <div className={cn(
      "w-64 rounded-xl border border-slate-700 bg-slate-900/80 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-200",
      selected && "border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]",
      trouble && "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
    )}>
      {/* Input Handle */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-sky-400 border-2 border-slate-900" />
      
      {/* Header */}
      <div className={cn(
        "px-3 py-2 flex items-center justify-between border-b border-slate-700/50",
        trouble ? "bg-red-500/20" : "bg-slate-800/50"
      )}>
        <div className="flex items-center gap-2">
          {getTierIcon(tier)}
          <span className="font-bold text-sm text-slate-100">{label}</span>
        </div>
        <button 
          onClick={() => onToggleTrouble && onToggleTrouble()}
          className={cn(
            "p-1 rounded-md transition-colors",
            trouble ? "text-red-400 bg-red-400/10 hover:bg-red-400/20" : "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
          )}
          title="Toggle Trouble"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Tier & Status */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">{getTierName(tier)}</span>
          {trouble ? (
            <span className="flex items-center gap-1 text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Conflito
            </span>
          ) : (
            <span className="text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">Ativo</span>
          )}
        </div>

        {/* Slots */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Slots:</span>
          <div className="flex gap-1">
            {Array.from({ length: slotsMax }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-3 h-3 rounded-sm border",
                  i < slotsUsed ? "bg-sky-400 border-sky-500" : "bg-slate-800 border-slate-700"
                )}
              />
            ))}
          </div>
        </div>

        {/* Passives */}
        {passives && passives.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Propriedades</span>
            {passives.map((passive, idx) => (
              <div key={idx} className="text-xs text-slate-300 bg-slate-800/50 rounded px-2 py-1 border border-slate-700/50">
                {passive}
              </div>
            ))}
          </div>
        )}

        {/* Silo / Storage */}
        {siloMax > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Armazenamento:</span>
              <span className={cn("font-medium", storagePercent >= 100 ? "text-amber-400" : "text-sky-400")}>
                {siloCurrent} / {siloMax} Ton
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  storagePercent >= 100 ? "bg-amber-400" : "bg-sky-400",
                  trouble && "bg-slate-600"
                )}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-sky-400 border-2 border-slate-900" />
    </div>
  );
}
