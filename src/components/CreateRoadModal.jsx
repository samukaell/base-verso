import React, { useState } from 'react';
import { X, ArrowRightLeft, Waypoints } from 'lucide-react';
import { criarEstrada } from '../request/request';

export default function CreateRoadModal({ connection, nodes, onClose }) {
  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      origemSetorId: connection.source,
      destinoSetorId: connection.target,
      nome: nome.trim() === '' ? null : nome.trim(),
      capacidadeFluxo: Number(capacidade)
    };

    const result = await criarEstrada(payload);

    if (result && result.success === false) {
      setErrorMsg(result.message);
      setIsSubmitting(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Waypoints className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-bold text-lg text-slate-100 leading-tight">Pavimentar Rota</h2>
              <span className="text-xs text-slate-400">Conexão Logística</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="bg-red-950/50 border border-red-900 text-red-400 text-xs p-3 rounded">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-2 bg-slate-800/50 border border-slate-700 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-mono text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-700 max-w-[120px] truncate" title={sourceNode?.data?.nome}>{sourceNode?.data?.nome || connection.source}</span>
              <ArrowRightLeft className="w-4 h-4 text-slate-500" />
              <span className="font-mono text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-700 max-w-[120px] truncate" title={targetNode?.data?.nome}>{targetNode?.data?.nome || connection.target}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome da Rota (Opcional)</label>
            <input 
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Rodovia de Suprimentos Alpha"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacidade de Fluxo (Ton/dia)</label>
            <input 
              required
              type="number"
              min="10"
              step="10"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Estabelecendo...' : 'Criar Estrada'}
          </button>
        </form>
      </div>
    </div>
  );
}
