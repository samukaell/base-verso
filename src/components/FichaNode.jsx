import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Crosshair, Shield } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Helper to draw a top-down 3D cylinder/circle layer
const TopDownCylinder = ({ w, h, x, y, depth, color, sideColor, isOperando, children, className }) => {
  return (
    <div 
      className={cn("absolute transition-all duration-700 ease-in-out rounded-full", className)}
      style={{ 
        width: w, 
        height: h, 
        left: x, 
        top: y,
        transform: !isOperando ? `translate(${depth}px, ${depth}px)` : 'translate(0px, 0px)',
      }}
    >
      {/* 3D Depth (bottom-right shadow/extrusion) */}
      <div 
        className={cn("absolute inset-0 rounded-full transition-all duration-700 ease-in-out border-black", !isOperando ? "border-0" : "border-[4px]")}
        style={{
          backgroundColor: sideColor,
          transform: !isOperando ? 'translate(0, 0)' : `translate(${depth}px, ${depth}px)`,
        }}
      />
      
      {/* Top Face */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full border-[4px] border-black flex items-center justify-center transition-all duration-700 ease-in-out",
          !isOperando && "brightness-50 grayscale"
        )}
        style={{ backgroundColor: color }}
      >
        {children}
      </div>
    </div>
  );
};

// Helper for the gun barrel (top down)
const TopDownBarrel = ({ w, h, x, y, depth, color, sideColor, isOperando, className }) => {
  return (
    <div 
      className={cn("absolute transition-all duration-700 ease-in-out", className)}
      style={{ 
        width: w, 
        height: h, 
        left: x, 
        top: y,
        transform: !isOperando ? `translate(${depth}px, ${depth}px)` : 'translate(0px, 0px)',
      }}
    >
      {/* 3D Depth */}
      <div 
        className={cn("absolute inset-0 transition-all duration-700 ease-in-out border-black", !isOperando ? "border-0" : "border-[4px]")}
        style={{
          backgroundColor: sideColor,
          transform: !isOperando ? 'translate(0, 0)' : `translate(${depth}px, ${depth}px)`,
        }}
      />
      
      {/* Top Face */}
      <div 
        className={cn(
          "absolute inset-0 border-[4px] border-black transition-all duration-700 ease-in-out",
          !isOperando && "brightness-50 grayscale"
        )}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default function FichaNode({ data, selected }) {
  const { 
    id, 
    nome, 
    status,
    width = 250,  // Standard sector width
    height = 150, // Standard sector height
    onToggleTrouble
  } = data;

  const isOperando = status === 'OPERANDO' || status === 'ATIVO';

  if (data.isEmpty) {
    return (
      <div 
        className="border-2 border-dashed border-white/20 rounded-full flex items-center justify-center"
        style={{ width: 150, height: 150 }}
      >
        <span className="text-white/30 font-bold uppercase tracking-widest text-xs text-center">Espaço</span>
      </div>
    );
  }

  // Turret parts colors
  const primaryColor = '#f04842';
  const primarySide = '#b02822';
  
  const darkColor = '#222222';
  const darkSide = '#000000';

  const barrelColor = '#555555';
  const barrelSide = '#222222';

  return (
    <div 
      className={cn(
        "relative transition-all duration-300 pointer-events-none flex items-center justify-center",
        selected && "scale-105"
      )}
      style={{ width, height }}
    >
      <div className={cn("relative w-full h-full pointer-events-auto", selected && "drop-shadow-[0_0_15px_rgba(240,72,66,0.8)]")}>
        
        {/* Shadow placeholder when lowered */}
        <div className="absolute top-[0px] left-[50px] w-[150px] h-[150px] bg-black/40 rounded-full blur-md -z-10" />

        
        {/* --- TOP-DOWN TURRET COMPOSITION --- */}

        {/* 1. Base Platform (Large Circle) */}
        <TopDownCylinder 
          w={160} h={160} x={45} y={-5} depth={15}
          color={primaryColor} sideColor={primarySide}
          isOperando={isOperando}
          className="z-10"
        >
          {/* Inner details for base */}
          <div className="w-[130px] h-[130px] rounded-full border-4 border-[#b02822] border-dashed opacity-50"></div>
        </TopDownCylinder>

        {/* 3. Main Head (Stationary so its shadow doesn't spin) */}
        <TopDownCylinder 
          w={100} h={100} x={75} y={25} depth={20}
          color={'#222'} sideColor={'#000'}
          isOperando={isOperando}
          className="z-20"
        >
          {/* --- SPINNING BARRELS AND CROSSHAIR INSIDE HEAD --- */}
          <div className={cn("absolute inset-0 flex items-center justify-center", isOperando && "animate-[spin_6s_linear_infinite]")} style={{ transformOrigin: 'center' }}>
            {/* Gun Barrels (Flat so spinning doesn't break 3D shadow) */}
            <div 
              className={cn("absolute bg-[#222] border-2 border-black transition-all duration-700", !isOperando && "brightness-50 grayscale")} 
              style={{ width: 25, height: 80, left: 20, top: -45, borderRadius: '4px' }} 
            />
            <div 
              className={cn("absolute bg-[#222] border-2 border-black transition-all duration-700", !isOperando && "brightness-50 grayscale")} 
              style={{ width: 25, height: 80, left: 55, top: -45, borderRadius: '4px' }} 
            />
            
            {/* The Spinning Crosshair */}
            <Crosshair className="w-10 h-10 text-white/80 relative z-30" />
          </div>
        </TopDownCylinder>



        {/* --- Top Floating Banner (Info) --- */}
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-50">
          <div className="bg-black/90 border-2 border-[#f04842]/50 px-3 py-1 flex flex-col items-center shadow-lg rounded">
            <span className="font-bold text-[10px] text-white uppercase tracking-widest">{nome || 'Sistema de Defesa'}</span>
          </div>
        </div>

        {/* Footer Bar */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleTrouble && onToggleTrouble(data.id); }} 
          className="absolute bottom-0 left-8 right-8 bg-black/90 p-1.5 flex items-center justify-center gap-2 border-t-2 border-x-2 border-b-2 transition-colors cursor-pointer rounded pointer-events-auto z-50 shadow-[0_0_15px_rgba(240,72,66,0.3)] hover:shadow-[0_0_25px_rgba(240,72,66,0.6)]" 
          style={{ borderColor: '#80100a' }}
        >
          <Shield className="w-3 h-3" style={{ color: '#f04842' }} />
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#f04842' }}>
            {isOperando ? "SISTEMA ATIVO" : "SISTEMA OFFLINE"}
          </span>
        </button>

      </div>
    </div>
  );
}
