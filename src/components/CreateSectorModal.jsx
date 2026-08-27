import React, { useState, useEffect } from 'react';
import { X, Plus, MapPin, Shield, Zap } from 'lucide-react';
import { criarNovoSetor, listarEstruturasBase } from '../request/request';

export default function CreateSectorModal({ baseId, onClose }) {
  const [formData, setFormData] = useState({
    nome: '',
    posicaoX: 0,
    posicaoY: 0,
    nivelDefesa: 1,
    provedorEnergiaId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [geradoresEnergia, setGeradoresEnergia] = useState([]);
  const [isLoadingGeradores, setIsLoadingGeradores] = useState(true);

  useEffect(() => {
    async function loadGeradores() {
      setIsLoadingGeradores(true);
      const result = await listarEstruturasBase(baseId, 'ENERGIA');
      if (result && result.success) {
        setGeradoresEnergia(result.estruturas || []);
      }
      setIsLoadingGeradores(false);
    }
    
    if (baseId) {
      loadGeradores();
    }
  }, [baseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nome' || name === 'provedorEnergiaId' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!baseId) {
      setErrorMsg('Erro: ID da base não encontrado.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      baseId,
      nome: formData.nome,
      posicaoX: formData.posicaoX,
      posicaoY: formData.posicaoY,
      nivelDefesa: formData.nivelDefesa,
      provedorEnergiaId: formData.provedorEnergiaId.trim() === '' ? null : formData.provedorEnergiaId.trim(),
    };

    const result = await criarNovoSetor(payload);

    if (result && result.success === false) {
      setErrorMsg(result.message);
      setIsSubmitting(false);
    } else {
      // Sucesso! Recarregar a página para buscar todos os setores novamente
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-bold text-lg text-slate-100 leading-tight">Construir Novo Setor</h2>
              <span className="text-xs text-slate-400">Expansão de Base</span>
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome do Setor</label>
            <input 
              required
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Distrito de Fundição"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3"/> Posição X</label>
              <input 
                required
                type="number"
                name="posicaoX"
                value={formData.posicaoX}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3"/> Posição Y</label>
              <input 
                required
                type="number"
                name="posicaoY"
                value={formData.posicaoY}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Shield className="w-3 h-3"/> Nível de Defesa</label>
            <input 
              required
              type="number"
              min="1"
              name="nivelDefesa"
              value={formData.nivelDefesa}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Zap className="w-3 h-3"/> Provedor de Energia (Opcional)</label>
            <select
              name="provedorEnergiaId"
              value={formData.provedorEnergiaId}
              onChange={handleChange}
              disabled={isLoadingGeradores}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 appearance-none disabled:opacity-50"
            >
              <option value="">Nenhum (Começará Sem Energia)</option>
              {geradoresEnergia.map(gerador => (
                <option key={gerador.setor_id} value={gerador.setor_id}>
                  {gerador.nome} ({gerador.setor_nome}) - {gerador.producao_kwh_hora} kWh
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Construindo...' : 'Criar Setor'}
          </button>
        </form>
      </div>
    </div>
  );
}
