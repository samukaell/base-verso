import React from 'react';
import { X, Box, Zap, Beaker, Package, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const getTierIcon = (tier) => {
  switch (tier) {
    case 1: return <Zap className="w-5 h-5 text-emerald-400" />;
    case 2: return <Beaker className="w-5 h-5 text-blue-400" />;
    case 3: return <Package className="w-5 h-5 text-purple-400" />;
    default: return <Box className="w-5 h-5 text-slate-400" />;
  }
};

const getTierName = (tier) => {
  switch (tier) {
    case 1: return "Tier 1: Extração Bruta";
    case 2: return "Tier 2: Refino";
    case 3: return "Tier 3: P&D / Avançado";
    default: return "Setor Auxiliar";
  }
};

export default function DetailsPanel({ node, onClose, onToggleTrouble }) {
  if (!node) return null;
  const { data } = node;

  const storagePercent = data.siloMax > 0 
    ? Math.min(100, Math.round((data.siloCurrent / data.siloMax) * 100)) 
    : 0;

  return (
    <div className="absolute top-4 right-4 bottom-4 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col z-20 overflow-hidden">
      {/* Header */}
      <div className={cn(
        "p-4 flex items-start justify-between border-b border-slate-700/50",
        data.trouble ? "bg-red-500/20" : "bg-sky-900/20"
      )}>
        <div className="flex gap-3">
          <div className="mt-1">{getTierIcon(data.tier)}</div>
          <div>
            <h2 className="font-bold text-lg text-slate-100 leading-tight">{data.label}</h2>
            <span className="text-xs font-medium text-slate-400">{getTierName(data.tier)}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        
        {/* Description */}
        {data.description && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Descrição</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.description}
            </p>
          </div>
        )}

        {/* Status Alert */}
        {data.trouble && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-400">Em Conflito / Paralisado</h4>
              <p className="text-xs text-red-300/80 mt-1">Este setor não irá gerar produção nem processar rotas logísticas enquanto estiver neste estado.</p>
            </div>
          </div>
        )}

        {/* Specs */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Especificações</h3>
          
          <div className="space-y-3">
            {/* Slots */}
            <div className="flex justify-between items-center bg-slate-800/40 p-2 rounded-lg border border-slate-700/30">
              <span className="text-sm text-slate-400">Slots Ocupados</span>
              <div className="flex gap-1.5">
                {Array.from({ length: data.slotsMax }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-4 h-4 rounded-sm border",
                      i < data.slotsUsed ? "bg-sky-500 border-sky-400" : "bg-slate-800 border-slate-700"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Passives */}
            {data.passives && data.passives.length > 0 && (
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30 space-y-2">
                <span className="text-sm text-slate-400 block mb-1">Passivas e Produção</span>
                {data.passives.map((passive, idx) => {
                  const isNegative = passive.startsWith('-');
                  return (
                    <div key={idx} className={cn(
                      "text-xs px-2 py-1.5 rounded font-medium border",
                      isNegative 
                        ? "bg-amber-900/30 text-amber-400 border-amber-700/50" 
                        : "bg-emerald-900/30 text-emerald-400 border-emerald-700/50"
                    )}>
                      {passive}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Silo */}
        {data.siloMax > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Inventário (Silo)</h3>
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Ocupação Atual</span>
                <span className={cn("font-bold", storagePercent >= 100 ? "text-amber-400" : "text-sky-400")}>
                  {data.siloCurrent} / {data.siloMax} Ton
                </span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    storagePercent >= 100 ? "bg-amber-400" : "bg-sky-500"
                  )}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
              <div className="mt-2 text-right">
                <span className="text-xs text-slate-500">{storagePercent}% cheio</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/80">
        <button 
          onClick={() => onToggleTrouble(node.id)}
          className={cn(
            "w-full font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2",
            data.trouble 
              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/20" 
              : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20"
          )}
        >
          {data.trouble ? "Resolver Conflito" : "Declarar Conflito"}
        </button>
      </div>

    </div>
  );
}
