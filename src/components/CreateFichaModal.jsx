import React, { useState } from 'react';
import { X, FileText, Zap, Shield, Target, Crosshair, Heart } from 'lucide-react';
import { criarNovaFicha } from '../request/request';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function CreateFichaModal({ baseId, onClose, defaultX = 0, defaultY = 0 }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    forca: 0,
    habilidade: 0,
    resistencia: 0,
    armadura: 0,
    poder: 0,
    energiaRequeridaKwh: 0,
    vantagens: '',
    desvantagens: '',
    skills: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'nome' || name === 'descricao' || name === 'vantagens' || name === 'desvantagens' || name === 'skills') 
        ? value 
        : Number(value)
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

    try {
      const result = await criarNovaFicha({
        baseId: baseId,
        nome: formData.nome,
        descricao: formData.descricao,
        posicaoX: defaultX,
        posicaoY: defaultY,
        forca: formData.forca,
        habilidade: formData.habilidade,
        resistencia: formData.resistencia,
        armadura: formData.armadura,
        poder: formData.poder,
        energiaRequeridaKwh: formData.energiaRequeridaKwh,
        vantagens: formData.vantagens ? formData.vantagens.split(',').map(v => v.trim()).filter(v => v) : [],
        desvantagens: formData.desvantagens ? formData.desvantagens.split(',').map(v => v.trim()).filter(v => v) : [],
        skills: formData.skills ? formData.skills.split(',').map(v => v.trim()).filter(v => v) : [],
      });

      if (result && result.success) {
        window.location.reload();
      } else {
        setErrorMsg(result?.message || 'Erro ao criar a ficha.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro inesperado ao criar a ficha.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border-2 border-[#f04842] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black p-4 border-b-2 border-[#f04842] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#f04842] p-2 rounded">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Nova Ficha / Defesa</h2>
              <p className="text-[#f04842] text-sm font-mono">Registro Tático: [{defaultX}, {defaultY}]</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded text-red-200 font-mono text-sm">
              {errorMsg}
            </div>
          )}

          <form id="create-ficha-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-white text-lg border-b border-[#333] pb-2 font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#f04842]" /> 1. Informações Básicas
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">NOME DA FICHA/ESTRUTURA</label>
                  <input 
                    type="text" 
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full bg-[#111] border border-[#333] text-white p-3 rounded focus:outline-none focus:border-[#f04842] font-mono transition-colors"
                    placeholder="Ex: Sentinela Automatizado MK-II"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">DESCRIÇÃO (Opcional)</label>
                  <textarea 
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={2}
                    className="w-full bg-[#111] border border-[#333] text-white p-3 rounded focus:outline-none focus:border-[#f04842] font-mono transition-colors"
                    placeholder="Breve descrição da unidade..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-lg border-b border-[#333] pb-2 font-mono flex items-center gap-2 mt-6">
                <Crosshair className="w-4 h-4 text-[#f04842]" /> 2. Atributos de Combate
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[#111] p-3 rounded border border-[#333]">
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase text-center">Força</label>
                  <input type="number" name="forca" value={formData.forca} onChange={handleChange} min="0" className="w-full bg-black text-white p-2 rounded text-center font-bold font-mono focus:outline-none focus:border-[#f04842] border border-transparent" />
                </div>
                <div className="bg-[#111] p-3 rounded border border-[#333]">
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase text-center">Poder</label>
                  <input type="number" name="poder" value={formData.poder} onChange={handleChange} min="0" className="w-full bg-black text-white p-2 rounded text-center font-bold font-mono focus:outline-none focus:border-[#f04842] border border-transparent" />
                </div>
                <div className="bg-[#111] p-3 rounded border border-[#333]">
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase text-center flex justify-center gap-1"><Shield className="w-3 h-3"/> Armadura</label>
                  <input type="number" name="armadura" value={formData.armadura} onChange={handleChange} min="0" className="w-full bg-black text-white p-2 rounded text-center font-bold font-mono focus:outline-none focus:border-[#f04842] border border-transparent" />
                </div>
                <div className="bg-[#111] p-3 rounded border border-[#333]">
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase text-center flex justify-center gap-1"><Target className="w-3 h-3"/> Habilidade</label>
                  <input type="number" name="habilidade" value={formData.habilidade} onChange={handleChange} min="0" className="w-full bg-black text-white p-2 rounded text-center font-bold font-mono focus:outline-none focus:border-[#f04842] border border-transparent" />
                </div>
                <div className="bg-[#111] p-3 rounded border border-[#333]">
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase text-center flex justify-center gap-1"><Heart className="w-3 h-3"/> Resistência</label>
                  <input type="number" name="resistencia" value={formData.resistencia} onChange={handleChange} min="0" className="w-full bg-black text-white p-2 rounded text-center font-bold font-mono focus:outline-none focus:border-[#f04842] border border-transparent" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-lg border-b border-[#333] pb-2 font-mono flex items-center gap-2 mt-6">
                <Target className="w-4 h-4 text-[#f04842]" /> 3. Skills e Modificadores
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">VANTAGENS (Separadas por vírgula)</label>
                  <input type="text" name="vantagens" value={formData.vantagens} onChange={handleChange} className="w-full bg-[#111] border border-[#333] text-white p-3 rounded focus:outline-none focus:border-[#f04842] font-mono" placeholder="Ex: Armadura Extra, Visão Noturna" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">DESVANTAGENS (Separadas por vírgula)</label>
                  <input type="text" name="desvantagens" value={formData.desvantagens} onChange={handleChange} className="w-full bg-[#111] border border-[#333] text-white p-3 rounded focus:outline-none focus:border-[#f04842] font-mono" placeholder="Ex: Bateria Limitada, Ponto Fraco" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">SKILLS (Separadas por vírgula)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full bg-[#111] border border-[#333] text-white p-3 rounded focus:outline-none focus:border-[#f04842] font-mono" placeholder="Ex: Disparo de Supressão, Campo de Força" />
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-yellow-900/20 p-4 rounded border border-yellow-900/50 mt-6">
              <h3 className="text-yellow-500 text-lg border-b border-yellow-900/50 pb-2 font-mono flex items-center gap-2">
                <Zap className="w-4 h-4" /> 4. Consumo de Energia Geral (kWh)
              </h3>
              <p className="text-xs text-yellow-500/70 mb-3 font-mono">
                Fichas consomem energia diretamente da Matriz Global da Base, não de um provedor específico.
              </p>
              <div>
                <input 
                  type="number" 
                  name="energiaRequeridaKwh"
                  required
                  value={formData.energiaRequeridaKwh}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full bg-[#111] border border-yellow-900/50 text-white p-3 rounded focus:outline-none focus:border-yellow-500 font-mono transition-colors"
                  placeholder="0.0"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="bg-black p-4 border-t-2 border-[#f04842] flex justify-end gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded font-mono font-bold text-gray-400 hover:text-white transition-colors"
          >
            CANCELAR
          </button>
          <button 
            type="submit"
            form="create-ficha-form"
            disabled={isSubmitting}
            className="bg-[#f04842] hover:bg-red-600 text-white px-8 py-2 rounded font-mono font-bold shadow-[0_0_15px_rgba(240,72,66,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'CRIANDO...' : 'ALOCAR FICHA'}
          </button>
        </div>
      </div>
    </div>
  );
}
