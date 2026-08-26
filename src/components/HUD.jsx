import React from 'react';
import { FastForward, Activity } from 'lucide-react';

export default function HUD({ onAdvanceDowntime, dayCount = 1 }) {
  return (
    <div className="absolute top-4 left-4 z-10 flex gap-4 pointer-events-none">
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-lg pointer-events-auto w-72">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-sky-400" />
          <h1 className="text-lg font-bold text-slate-100">Controle de Base</h1>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">Tempo Atual</span>
            <span className="text-slate-200 font-bold font-mono">Dia {dayCount}</span>
          </div>

          <button 
            onClick={onAdvanceDowntime}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors shadow-[0_0_10px_rgba(56,189,248,0.3)] hover:shadow-[0_0_15px_rgba(56,189,248,0.5)]"
          >
            <FastForward className="w-4 h-4" />
            Avançar Downtime
          </button>
        </div>
      </div>
    </div>
  );
}
