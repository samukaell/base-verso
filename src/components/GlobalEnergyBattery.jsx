import React, { useMemo, useState } from 'react';
import { Zap, Info } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function GlobalEnergyBattery({ nodes }) {
  const [showDetails, setShowDetails] = useState(false);

  const { totalCapacity, totalRemaining, providers } = useMemo(() => {
    let capacity = 0;
    let remaining = 0;
    
    // Group providers
    const provs = [];

    nodes.forEach(n => {
      if (n.data?.isEmpty) return;
      
      const prod = Number(n.data.producao_kwh_hora) || 0;
      const rest = Number(n.data.restante_kwh_hora) || 0;
      
      if (prod > 0) {
        capacity += prod;
        remaining += rest;
        
        // Find consumers of this provider
        const consumers = nodes.filter(
          consumer => consumer.data?.setor_energia_provedor_id === n.id && consumer.id !== n.id
        );
        
        provs.push({
          id: n.id,
          name: n.data.nome || 'Setor Desconhecido',
          prod,
          rest,
          consumed: Math.max(0, prod - rest),
          consumers: consumers.map(c => c.data.nome || 'Setor Desconhecido')
        });
      }
    });

    return { totalCapacity: capacity, totalRemaining: remaining, providers: provs };
  }, [nodes]);

  if (totalCapacity === 0) return null; // Não mostra bateria se a base não tiver geradores

  const pctRemaining = Math.max(0, Math.min(100, (totalRemaining / totalCapacity) * 100));

  return (
    <div 
      className="absolute bottom-4 right-4 z-[999] flex flex-col items-end gap-2 pointer-events-auto"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Detalhes expansíveis */}
      <div 
        className={cn(
          "bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg p-3 w-64 transition-all duration-300 origin-bottom-right absolute right-[110%] bottom-0",
          showDetails ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          Rede Elétrica da Base
        </h3>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {providers.map(prov => (
            <div key={prov.id} className="flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between items-center font-bold text-slate-200">
                <span className="truncate max-w-[120px]">{prov.name}</span>
                <span className="text-emerald-400">{prov.prod} kWh</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Consumido:</span>
                <span className="text-slate-300">{prov.consumed.toFixed(0)} kWh</span>
              </div>
              {prov.consumers.length > 0 && (
                <div className="bg-slate-800/50 p-1.5 rounded border border-slate-700/50 mt-1">
                  <span className="text-slate-500 block mb-0.5">Fornecendo para:</span>
                  <ul className="list-disc list-inside text-slate-300">
                    {prov.consumers.map((cName, i) => (
                      <li key={i} className="truncate">{cName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bateria principal */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center cursor-help group relative">
        
        {/* Ícone e Título */}
        <div className="flex flex-col items-center gap-1 mb-3">
          <Zap className="w-5 h-5 text-emerald-400 group-hover:animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Energia</span>
        </div>
        
        {/* Desenho da Bateria Vertical */}
        <div className="relative flex flex-col items-center">
          {/* Tampa superior da bateria (Polo Positivo) */}
          <div className="w-5 h-2 bg-slate-600 rounded-t-sm border-t border-x border-slate-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] z-10"></div>
          
          {/* Corpo da Bateria */}
          <div className="w-12 h-36 bg-slate-800/80 rounded border-2 border-slate-600 flex flex-col justify-end overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] relative">
            
            {/* Fundo listrado (Área consumida/vazia) */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, #000 4px, #000 8px)' }}></div>

            {/* Líquido/Energia (Verde = Livre) preenchendo de baixo para cima */}
            <div 
              className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-700 ease-in-out relative z-10 border-t border-emerald-300/50"
              style={{ height: `${pctRemaining}%` }}
            >
              {/* Brilho interno para dar volume cilíndrico */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/30 pointer-events-none"></div>
              
              {/* Efeito de onda na borda superior da energia */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-full blur-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Informações abaixo da bateria */}
        <div className="mt-3 flex flex-col items-center gap-1">
          <span className="text-lg font-extrabold text-white drop-shadow-md">
            {pctRemaining.toFixed(1)}%
          </span>
          <div className="flex flex-col items-center text-[9px] text-slate-400 uppercase font-mono tracking-wider">
            <span>{totalRemaining.toFixed(0)} kWh Livre</span>
            <span className="text-slate-500">de {totalCapacity.toFixed(0)} kWh</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
