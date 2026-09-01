import React, { useState } from 'react';
import { X, Hammer, Database, Zap, Factory } from 'lucide-react';
import { adicionarInstalacoesSetor } from '../request/request';

export default function AddInstallationModal({ setorId, onClose }) {
  const [tipo, setTipo] = useState('fabrica');
  const [nome, setNome] = useState('');
  
  // Específicos Fábrica
  const [isExtracao, setIsExtracao] = useState(false);
  
  // Específicos Armazenamento
  const [capacidade, setCapacidade] = useState(1000);
  
  // Específicos Energia
  const [tipoGeracao, setTipoGeracao] = useState('SOLAR');
  const [producao, setProducao] = useState(5000);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = { setorId };

    if (tipo === 'fabrica') {
      payload.fabrica = { 
        nome, 
        is_extracao: isExtracao 
      };
    } else if (tipo === 'armazenamento') {
      payload.armazenamento = { 
        nome, 
        capacidade_max_ton: capacidade 
      };
    } else if (tipo === 'energia') {
      payload.energia = { 
        nome, 
        tipo_geracao: tipoGeracao, 
        producao_kwh_hora: producao,
        producao_kwh: producao, // fallback
        producao: producao // fallback
      };
    }

    console.log("Enviando payload para instalação:", payload);

    const result = await adicionarInstalacoesSetor(payload);

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
            <Hammer className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-lg text-slate-100 leading-tight">Adicionar Instalação</h2>
              <span className="text-xs text-slate-400 font-mono">{setorId}</span>
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

          {/* Tipo de Instalação */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTipo('fabrica')}
              className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${tipo === 'fabrica' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
            >
              <Factory className="w-5 h-5" /> Fábrica
            </button>
            <button
              type="button"
              onClick={() => setTipo('armazenamento')}
              className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${tipo === 'armazenamento' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
            >
              <Database className="w-5 h-5" /> Armazém
            </button>
            <button
              type="button"
              onClick={() => setTipo('energia')}
              className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${tipo === 'energia' ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
            >
              <Zap className="w-5 h-5" /> Energia
            </button>
          </div>

          {/* Nome (Comum para todos) */}
          <div className="space-y-1 mt-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome da Instalação</label>
            <input 
              required
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={`Ex: ${tipo === 'fabrica' ? 'Fábrica de Componentes' : tipo === 'armazenamento' ? 'Silo Central' : 'Reator Principal'}`}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Campos Específicos: Fábrica */}
          {tipo === 'fabrica' && (
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg mt-2 cursor-pointer" onClick={() => setIsExtracao(!isExtracao)}>
              <input 
                type="checkbox"
                checked={isExtracao}
                onChange={() => {}}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-200">É um Extrator?</span>
                <span className="text-xs text-slate-400">Marque se esta instalação coleta matéria-prima ao invés de manufaturar.</span>
              </div>
            </div>
          )}

          {/* Campos Específicos: Armazenamento */}
          {tipo === 'armazenamento' && (
            <div className="space-y-1 mt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacidade Máxima (Ton)</label>
              <input 
                required
                type="number"
                min="10"
                value={capacidade}
                onChange={(e) => setCapacidade(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          {/* Campos Específicos: Energia */}
          {tipo === 'energia' && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo de Geração</label>
                <select
                  value={tipoGeracao}
                  onChange={(e) => setTipoGeracao(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 appearance-none"
                >
                  <option value="SOLAR">Solar</option>
                  <option value="FUSAO">Fusão Nuclear</option>
                  <option value="EOLICA">Eólica</option>
                  <option value="GEOTERMICA">Geotérmica</option>
                  <option value="HIDRELETRICA">Hidrelétrica</option>
                  <option value="TERMELETRICA">Termelétrica</option>
                  <option value="BIOMASSA">Biomassa</option>
                  <option value="MAREMOTRIZ">Maremotriz</option>
                  <option value="ONDOMOTRIZ">Ondomotriz</option>
                  <option value="TERMOSSOLAR">Termossolar</option>
                </select>
              </div>
              <div className="space-y-2 col-span-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacidade de Produção (0 - 4.000 MWh)</label>
                  <span className="text-sm font-bold text-emerald-400">
                    {producao >= 1000 
                      ? `${(producao / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MWh` 
                      : `${producao} kWh`}
                  </span>
                </div>
                <input 
                  required
                  type="range"
                  min="0"
                  max="4000000"
                  step="1000"
                  value={producao}
                  onChange={(e) => setProducao(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <input 
                  type="number"
                  min="0"
                  max="4000000"
                  value={producao}
                  onChange={(e) => setProducao(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 mt-2"
                  placeholder="Ou digite o valor exato em kWh..."
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-900 disabled:opacity-50 mt-6"
          >
            {isSubmitting ? 'Construindo...' : 'Adicionar Instalação'}
          </button>
        </form>
      </div>
    </div>
  );
}
