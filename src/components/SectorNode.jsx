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
        className="border-[6px] border-black transition-colors flex items-center justify-center cursor-pointer shadow-sm group hover:brightness-110"
        onClick={() => data.onCreateClick && data.onCreateClick()}
      >
        <span className="text-white font-bold text-5xl opacity-50 group-hover:opacity-100">+</span>
      </div>
    );
  }

  return (
    <div 
      style={{ width: data.width || 200, height: data.height || 150 }}
      className="relative group"
    >
      {/* Right Face (3D depth) */}
      <div 
        className="absolute bg-[#800015] border-[6px] border-black border-l-0 origin-top-left pointer-events-none"
        style={{ top: 0, left: '100%', width: '25px', height: '100%', transform: 'skewY(45deg)', zIndex: 0 }} 
      />
      
      {/* Bottom Face (3D depth) */}
      <div 
        className="absolute bg-[#b30026] border-[6px] border-black border-t-0 origin-top-left pointer-events-none"
        style={{ top: '100%', left: 0, width: '100%', height: '25px', transform: 'skewX(45deg)', zIndex: 0 }} 
      />

      {/* Front Face */}
      <div 
        style={{ backgroundColor: '#ff194b' }}
        className={cn(
          "absolute inset-0 border-[6px] border-black flex flex-col transition-all duration-200 z-10",
          selected && "border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]",
          hasTrouble && "brightness-50"
        )}
      >
        {/* Input Handle */}
        <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#ff194b] !border-black cursor-crosshair z-50 rounded-none opacity-0 hover:opacity-100" />
        
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

        {/* Footer (Icons) */}
        <div className="bg-black/20 px-2 py-1 flex items-center justify-between border-t-[3px] border-black">
          <div className="flex gap-1">
            {nivel_defesa > 0 && <Shield className="w-4 h-4 text-slate-300" />}
            {distritos_energia?.length > 0 && <Zap className="w-4 h-4 text-emerald-400" />}
            {distritos_armazenamento?.length > 0 && <Database className="w-4 h-4 text-sky-400" />}
            {fabricas?.length > 0 && <Factory className="w-4 h-4 text-purple-400" />}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleTrouble && onToggleTrouble(data.id); }}
            className="flex items-center gap-1 hover:bg-black/20 px-1 rounded transition-colors"
          >
            {hasTrouble ? (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]"></div>
            )}
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              {hasTrouble ? "SEM ENERGIA" : "OPERANDO"}
            </span>
          </button>
        </div>

        {/* Output Handles */}
        <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#ff194b] !border-black cursor-crosshair z-50 rounded-none opacity-0 hover:opacity-100" />
        <Handle id="right" type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#ff194b] !border-black cursor-crosshair z-50 rounded-none opacity-0 hover:opacity-100" />
        <Handle id="left" type="source" position={Position.Left} className="!w-3 !h-3 !bg-[#ff194b] !border-black cursor-crosshair z-50 rounded-none opacity-0 hover:opacity-100" />
      </div>
    </div>
  );
}
