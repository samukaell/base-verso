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

  if (data.isEmpty) {
    return (
      <div 
        style={{ width: data.width || 200, height: data.height || 150, backgroundColor: '#708066' }}
        className="border-[6px] border-[#5a6652] transition-colors flex items-center justify-center cursor-pointer shadow-sm group hover:brightness-110"
        onClick={() => data.onCreateClick && data.onCreateClick()}
      >
        <div className="flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-[#5a6652] text-white flex items-center justify-center mb-2">
            <span className="text-2xl font-bold">+</span>
          </div>
          <span className="text-white/80 font-bold uppercase text-sm">Lote Vazio</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ width: data.width || 200, height: data.height || 150, backgroundColor: '#ff194b' }}
      className={cn(
        "border-[6px] border-slate-900 shadow-sm flex flex-col transition-all duration-200",
        selected && "border-sky-400 shadow-md",
        hasTrouble && "border-red-900 brightness-50"
      )}
    >
      {/* Input Handle */}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#ff194b] !border-slate-900 cursor-crosshair z-50 rounded-none opacity-0 hover:opacity-100" />
      
      {/* Header */}
      <div className={cn(
        "px-2 py-2 flex-grow flex flex-col items-center justify-center text-center",
        hasTrouble && "bg-black/30"
      )}>
        <span className="font-bold text-2xl text-white leading-tight drop-shadow-md">{nome}</span>
        {data.playerInfo && (
          <span className="text-xs font-bold text-white/80 mt-1 uppercase">Centro</span>
        )}
      </div>

      <div className="flex justify-between items-center bg-slate-800 p-1">
        <span className={cn("text-[10px] font-bold px-1", hasTrouble ? "text-red-400" : "text-emerald-400")}>
          {hasTrouble ? "INATIVO" : "OPERANDO"}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleTrouble && onToggleTrouble();
          }}
          className={cn(
            "p-1 transition-colors",
            hasTrouble ? "text-red-400 hover:text-red-300" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      </div>

      {/* Output Handle */}
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#ff194b] !border-slate-900 cursor-crosshair z-50 rounded-none opacity-0 hover:opacity-100" />
      <Handle id="right" type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#ff194b] !border-slate-900 cursor-crosshair z-50 rounded-none opacity-0 hover:opacity-100" />
      <Handle id="left" type="source" position={Position.Left} className="!w-3 !h-3 !bg-[#ff194b] !border-slate-900 cursor-crosshair z-50 rounded-none opacity-0 hover:opacity-100" />
    </div>
  );
}
