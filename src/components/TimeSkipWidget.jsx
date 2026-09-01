import React, { useState } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { pularTempoMundo } from '../request/request';

export default function TimeSkipWidget({ baseId, playerId, onTimeSkipComplete }) {
  const [isSkipping, setIsSkipping] = useState(false);
  const [skipResult, setSkipResult] = useState(null);
  const [requestedHours, setRequestedHours] = useState(0);

  const handleSkip = async (dias) => {
    if (isSkipping) return;
    const horas = dias * 24;
    setRequestedHours(horas);
    setIsSkipping(true);
    setSkipResult(null);
    
    const mundoId = playerId === 'C1214-B8' ? 'Terra-C1214-B8' : 'MUNDO-01';
    const result = await pularTempoMundo(mundoId, horas);
    
    if (result && result.success !== false) {
      setSkipResult(result);
      
      // Espera 2.5 segundos para o usuário ver a barra completa e os dados antes de recarregar
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } else {
      setIsSkipping(false);
      alert('Erro ao avançar o tempo!');
    }
  };

  const isComplete = skipResult !== null;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 mb-2 text-slate-300">
        <Clock className="w-4 h-4 text-sky-400" />
        <span className="text-sm font-bold">Avanço de Turno</span>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => handleSkip(1)}
          disabled={isSkipping}
          className="flex-1 flex items-center justify-center gap-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-1.5 px-2 rounded transition-colors shadow-lg"
        >
          +1 Dia
        </button>
        <button 
          onClick={() => handleSkip(7)}
          disabled={isSkipping}
          className="flex-1 flex items-center justify-center gap-1 bg-sky-800 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-1.5 px-2 rounded transition-colors shadow-lg"
        >
          +1 Semana
        </button>
      </div>
      
      {isSkipping && !isComplete && (
        <div className="mt-4 p-2 bg-slate-800/80 rounded border border-slate-700">
          <div className="flex justify-between text-[10px] text-sky-300 mb-1 font-bold">
            <span>Processando no Servidor...</span>
            <span className="animate-pulse">Calculando</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-950">
            <div className="h-full bg-sky-500 w-1/2 animate-pulse rounded-full" style={{ animationDuration: '0.8s' }} />
          </div>
        </div>
      )}

      {isComplete && (
        <div className="mt-4 p-2 bg-emerald-950/40 rounded border border-emerald-900/50">
          <div className="flex justify-between text-[10px] text-emerald-400 font-bold mb-1">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Turno Avançado</span>
            <span>100%</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-950 mb-2">
            <div className="h-full bg-emerald-500 w-full transition-all duration-500 rounded-full" />
          </div>
          <div className="text-center text-xs text-emerald-300/80 font-mono">
            {requestedHours}h computadas. Recarregando interface...
          </div>
        </div>
      )}
    </div>
  );
}
