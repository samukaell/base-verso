import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Crosshair, Shield } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function FichaNode({ data, selected }) {
  const { 
    id, 
    nome, 
    status,
    width = 250, 
    height = 150,
    onToggleTrouble
  } = data;

  const isOperando = status === 'OPERANDO' || status === 'ATIVO';

  if (data.isEmpty) {
    return (
      <div 
        className="border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center"
        style={{ width, height }}
      >
        <span className="text-white/30 font-bold uppercase tracking-widest text-sm">Espaço Disponível</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative transition-all duration-300",
        selected && "scale-105"
      )}
      style={{ width, height }}
    >
      {/* Wrapper that translates the building down to the ground */}
      <div 
        className="absolute inset-0 transition-transform duration-700 ease-in-out"
        style={{ transform: !isOperando ? 'translate(25px, 25px)' : 'translate(0px, 0px)' }}
      >
        {/* Right Face (3D depth) */}
        <div 
          className={cn("absolute border-black border-l-0 origin-top-left pointer-events-none transition-all duration-700 ease-in-out", !isOperando ? "border-0" : "border-[6px]")}
          style={{ 
            backgroundColor: '#d03832', // Darker shade of #f04842
            top: 0, 
            left: '100%', 
            width: !isOperando ? '0px' : '25px', 
            height: '100%', 
            transform: 'skewY(45deg)', 
            zIndex: 0 
          }} 
        />
        
        {/* Bottom Face (3D depth) */}
        <div 
          className={cn("absolute border-black border-t-0 origin-top-left pointer-events-none transition-all duration-700 ease-in-out", !isOperando ? "border-0" : "border-[6px]")}
          style={{ 
            backgroundColor: '#b02822', // Even darker shade for bottom
            top: '100%', 
            left: 0, 
            width: '100%', 
            height: !isOperando ? '0px' : '25px', 
            transform: 'skewX(45deg)', 
            zIndex: 0 
          }} 
        />

        {/* Top Edge / Banner */}
        <div className="h-6 bg-black w-full border-b-2 flex justify-between items-center px-2 z-20" style={{ borderColor: 'rgba(240,72,66,0.5)' }}>
          <div className="flex items-center gap-1.5">
            <div 
               className={cn("w-2 h-2 rounded-full", !isOperando && "bg-slate-500")}
               style={{ backgroundColor: isOperando ? '#f04842' : undefined }}
            ></div>
            <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: '#f04842' }}>DEFESA</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">{id?.slice(0,8)}</span>
        </div>

        {/* Front Face */}
        <div 
          style={{ backgroundColor: '#f04842' }}
          className={cn(
            "absolute inset-0 border-[6px] border-black flex flex-col transition-all duration-700 ease-in-out z-10",
            selected && "border-white shadow-[0_0_15px_rgba(240,72,66,0.5)]",
            !isOperando && "brightness-50 grayscale"
          )}
        >
          {/* Header */}
          <div className="px-2 py-2 flex-grow flex flex-col items-center justify-center text-center">
            <Crosshair className="w-8 h-8 text-white mb-2 opacity-80" />
            <span className="font-bold text-xl text-white leading-tight drop-shadow-md">{nome || 'Sistema de Defesa'}</span>
          </div>

          {/* Footer Bar */}
          <button onClick={(e) => { e.stopPropagation(); onToggleTrouble && onToggleTrouble(data.id); }} className="w-full bg-black/90 p-1.5 flex items-center justify-center gap-2 border-t-2 transition-colors cursor-pointer" style={{ borderColor: '#80100a' }}>
            <Shield className="w-3.5 h-3.5" style={{ color: '#f04842' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#f04842' }}>
              {isOperando ? "SISTEMA ATIVO" : "SISTEMA OFFLINE"}
            </span>
          </button>
        </div>

        {/* --- Top Handle --- */}
        <Handle id="top" type="source" position={Position.Top} className="!w-12 !h-12 !bg-transparent !border-none cursor-crosshair z-50 flex items-center justify-center group/handle">
          <div className="w-4 h-4 bg-white/40 border-2 border-white/40 rotate-45 flex items-center justify-center transition-all duration-200 group-hover/handle:border-white group-hover/handle:scale-125 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f04842'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}>
            <div className="-rotate-45 flex items-center justify-center w-full h-full relative pointer-events-none">
              <div className="w-2 h-0.5 bg-white/80 group-hover/handle:bg-white absolute"></div>
              <div className="w-0.5 h-2 bg-white/80 group-hover/handle:bg-white absolute"></div>
            </div>
          </div>
        </Handle>
        
        {/* --- Bottom Handle --- */}
        <Handle id="bottom" type="source" position={Position.Bottom} className="!w-12 !h-12 !bg-transparent !border-none cursor-crosshair z-50 flex items-center justify-center group/handle">
          <div className="w-4 h-4 bg-white/40 border-2 border-white/40 rotate-45 flex items-center justify-center transition-all duration-200 group-hover/handle:border-white group-hover/handle:scale-125 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f04842'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}>
            <div className="-rotate-45 flex items-center justify-center w-full h-full relative pointer-events-none">
              <div className="w-2 h-0.5 bg-white/80 group-hover/handle:bg-white absolute"></div>
              <div className="w-0.5 h-2 bg-white/80 group-hover/handle:bg-white absolute"></div>
            </div>
          </div>
        </Handle>

        {/* --- Right Handle --- */}
        <Handle id="right" type="source" position={Position.Right} className="!w-12 !h-12 !bg-transparent !border-none cursor-crosshair z-50 flex items-center justify-center group/handle">
          <div className="w-4 h-4 bg-white/40 border-2 border-white/40 rotate-45 flex items-center justify-center transition-all duration-200 group-hover/handle:border-white group-hover/handle:scale-125 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f04842'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}>
            <div className="-rotate-45 flex items-center justify-center w-full h-full relative pointer-events-none">
              <div className="w-2 h-0.5 bg-white/80 group-hover/handle:bg-white absolute"></div>
              <div className="w-0.5 h-2 bg-white/80 group-hover/handle:bg-white absolute"></div>
            </div>
          </div>
        </Handle>

        {/* --- Left Handle --- */}
        <Handle id="left" type="source" position={Position.Left} className="!w-12 !h-12 !bg-transparent !border-none cursor-crosshair z-50 flex items-center justify-center group/handle">
          <div className="w-4 h-4 bg-white/40 border-2 border-white/40 rotate-45 flex items-center justify-center transition-all duration-200 group-hover/handle:border-white group-hover/handle:scale-125 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f04842'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}>
            <div className="-rotate-45 flex items-center justify-center w-full h-full relative pointer-events-none">
              <div className="w-2 h-0.5 bg-white/80 group-hover/handle:bg-white absolute"></div>
              <div className="w-0.5 h-2 bg-white/80 group-hover/handle:bg-white absolute"></div>
            </div>
          </div>
        </Handle>
      </div>
    </div>
  );
}
