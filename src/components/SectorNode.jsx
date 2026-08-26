import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldAlert, Zap, Factory, Database, Shield } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function SectorNode({ data, selected }) {
  const { 
    nome, 
    status, 
    nivel_defesa = 0,
    distritos_energia = [],
    distritos_armazenamento = [],
    fabricas = [],
    onToggleTrouble
  } = data;

  const hasTrouble = status !== 'OPERANDO';

  return (
    <div className={cn(
      "w-72 rounded-xl border border-slate-700 bg-slate-900/80 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-200",
      selected && "border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]",
      hasTrouble && "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
    )}>
      {/* Input Handle */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-sky-400 border-2 border-slate-900" />
      
      {/* Header */}
      <div className={cn(
        "px-3 py-2 flex items-center justify-between border-b border-slate-700/50",
        hasTrouble ? "bg-red-500/20" : "bg-slate-800/50"
      )}>
        <div className="flex flex-col justify-center max-w-[200px]">
          <span className="font-bold text-sm text-slate-100 truncate block">{nome}</span>
          <span className={cn("text-xs font-medium", hasTrouble ? "text-red-400" : "text-emerald-400")}>
            {hasTrouble ? "CONFLITO / INATIVO" : "OPERANDO"}
          </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleTrouble && onToggleTrouble();
          }}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            hasTrouble ? "text-red-400 bg-red-400/10 hover:bg-red-400/20" : "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
          )}
          title="Alternar Status"
        >
          <ShieldAlert className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Nível de Defesa */}
        <div className="flex items-center gap-2 text-xs bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50">
          <Shield className="w-4 h-4 text-sky-400" />
          <span className="text-slate-300">Nível de Defesa:</span>
          <span className="font-bold text-sky-400 ml-auto">{nivel_defesa}</span>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-2">
          
          <div className="flex flex-col items-center justify-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <Factory className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-xs text-slate-400">Fábricas</span>
            <span className="text-sm font-bold text-slate-200">{fabricas.length}</span>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <Zap className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-xs text-slate-400">Energia</span>
            <span className="text-sm font-bold text-slate-200">{distritos_energia.length}</span>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <Database className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-xs text-slate-400">Silos</span>
            <span className="text-sm font-bold text-slate-200">{distritos_armazenamento.length}</span>
          </div>

        </div>
      </div>

      {/* Output Handle */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-sky-400 border-2 border-slate-900" />
    </div>
  );
}
