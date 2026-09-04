import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldAlert, Zap, Factory, Database, Shield, FileText } from 'lucide-react';
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
  
  // Base 15px + 1px por nível de defesa (escala mínima)
  const height3D = 15 + (Number(nivel_defesa) || 0) * 1;
  const roofTranslate = -height3D;

  if (data.isEmpty) {
    return (
      <div 
        style={{ width: data.width || 250, height: data.height || 150, backgroundColor: '#708066' }}
        className="border-[6px] border-black flex items-center justify-center gap-10 shadow-sm"
      >
        {/* Add Sector Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); data.onCreateClick && data.onCreateClick(); }}
          className="text-white font-bold text-5xl opacity-50 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
          title="Criar Setor"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{ width: data.width || 200, height: data.height || 150 }}
      className="relative group"
    >
      {/* Wrapper that translates the building UP so the base stays at 0,0 */}
      <div 
        className="absolute inset-0 transition-transform duration-700 ease-in-out"
        style={{ transform: hasTrouble ? 'translate(0px, 0px)' : `translate(${roofTranslate}px, ${roofTranslate}px)` }}
      >
        {/* Right Face (3D depth) */}
        <div 
          className={cn(
            "absolute bg-[#800015] border-black border-l-0 origin-top-left pointer-events-none transition-all duration-700 ease-in-out",
            hasTrouble ? "border-0" : "border-[6px]"
          )}
          style={{ 
            top: 0, 
            left: '100%', 
            width: hasTrouble ? '0px' : `${height3D}px`, 
            height: '100%', 
            transform: 'skewY(45deg)', 
            zIndex: 0 
          }} 
        />
        
        {/* Bottom Face (3D depth) */}
        <div 
          className={cn(
            "absolute bg-[#b30026] border-black border-t-0 origin-top-left pointer-events-none transition-all duration-700 ease-in-out",
            hasTrouble ? "border-0" : "border-[6px]"
          )}
          style={{ 
            top: '100%', 
            left: 0, 
            width: '100%', 
            height: hasTrouble ? '0px' : `${height3D}px`, 
            transform: 'skewX(45deg)', 
            zIndex: 0 
          }} 
        />

        {/* Front Face */}
        <div 
          style={{ backgroundColor: '#ff194b' }}
          className={cn(
            "absolute inset-0 border-[6px] border-black flex flex-col transition-all duration-700 ease-in-out z-10",
            selected && "border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]",
            hasTrouble && "brightness-50"
          )}
        >
        {/* Input Handle */}
        <Handle type="target" position={Position.Top} className="!w-12 !h-12 !bg-transparent !border-none cursor-crosshair z-50 flex items-center justify-center group/handle">
          <div className="w-4 h-4 bg-white/40 border-2 border-white/40 rotate-45 flex items-center justify-center transition-all duration-200 group-hover/handle:bg-[#ff194b] group-hover/handle:border-white group-hover/handle:scale-125 shadow-sm">
            <div className="-rotate-45 flex items-center justify-center w-full h-full relative pointer-events-none">
              <div className="w-2 h-0.5 bg-white/80 group-hover/handle:bg-white absolute"></div>
              <div className="w-0.5 h-2 bg-white/80 group-hover/handle:bg-white absolute"></div>
            </div>
          </div>
        </Handle>
        
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

        {data.processos_ativos_count > 0 && (
          <div className="absolute top-[-10px] right-[-10px] bg-amber-500 border-[3px] border-black text-black font-bold text-[10px] px-2 py-0.5 z-50 animate-pulse shadow-lg whitespace-nowrap">
            {data.processos_ativos_count} PROCESSO(S)
          </div>
        )}

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

        {/* --- Top Handle --- */}
        <Handle id="top" type="source" position={Position.Top} className="!w-12 !h-12 !bg-transparent !border-none cursor-crosshair z-50 flex items-center justify-center group/handle">
          <div className="w-4 h-4 bg-white/40 border-2 border-white/40 rotate-45 flex items-center justify-center transition-all duration-200 group-hover/handle:bg-[#ff194b] group-hover/handle:border-white group-hover/handle:scale-125 shadow-sm">
            <div className="-rotate-45 flex items-center justify-center w-full h-full relative pointer-events-none">
              <div className="w-2 h-0.5 bg-white/80 group-hover/handle:bg-white absolute"></div>
              <div className="w-0.5 h-2 bg-white/80 group-hover/handle:bg-white absolute"></div>
            </div>
          </div>
        </Handle>
        
        {/* --- Bottom Handle --- */}
        <Handle id="bottom" type="source" position={Position.Bottom} className="!w-12 !h-12 !bg-transparent !border-none cursor-crosshair z-50 flex items-center justify-center group/handle">
          <div className="w-4 h-4 bg-white/40 border-2 border-white/40 rotate-45 flex items-center justify-center transition-all duration-200 group-hover/handle:bg-[#ff194b] group-hover/handle:border-white group-hover/handle:scale-125 shadow-sm">
            <div className="-rotate-45 flex items-center justify-center w-full h-full relative pointer-events-none">
              <div className="w-2 h-0.5 bg-white/80 group-hover/handle:bg-white absolute"></div>
              <div className="w-0.5 h-2 bg-white/80 group-hover/handle:bg-white absolute"></div>
            </div>
          </div>
        </Handle>

        {/* --- Right Handle --- */}
        <Handle id="right" type="source" position={Position.Right} className="!w-12 !h-12 !bg-transparent !border-none cursor-crosshair z-50 flex items-center justify-center group/handle">
          <div className="w-4 h-4 bg-white/40 border-2 border-white/40 rotate-45 flex items-center justify-center transition-all duration-200 group-hover/handle:bg-[#ff194b] group-hover/handle:border-white group-hover/handle:scale-125 shadow-sm">
            <div className="-rotate-45 flex items-center justify-center w-full h-full relative pointer-events-none">
              <div className="w-2 h-0.5 bg-white/80 group-hover/handle:bg-white absolute"></div>
              <div className="w-0.5 h-2 bg-white/80 group-hover/handle:bg-white absolute"></div>
            </div>
          </div>
        </Handle>

        {/* --- Left Handle --- */}
        <Handle id="left" type="source" position={Position.Left} className="!w-12 !h-12 !bg-transparent !border-none cursor-crosshair z-50 flex items-center justify-center group/handle">
          <div className="w-4 h-4 bg-white/40 border-2 border-white/40 rotate-45 flex items-center justify-center transition-all duration-200 group-hover/handle:bg-[#ff194b] group-hover/handle:border-white group-hover/handle:scale-125 shadow-sm">
            <div className="-rotate-45 flex items-center justify-center w-full h-full relative pointer-events-none">
              <div className="w-2 h-0.5 bg-white/80 group-hover/handle:bg-white absolute"></div>
              <div className="w-0.5 h-2 bg-white/80 group-hover/handle:bg-white absolute"></div>
            </div>
          </div>
        </Handle>
      </div>
      </div>
    </div>
  );
}
