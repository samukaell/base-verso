import React, { useState } from 'react';
import { X, Beaker, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { criarNovoMaterial } from '../request/request';

export default function CreateMaterialModal({ onClose }) {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'MINERIO_BRUTO',
    nivelTier: 1,
    descricao: '',
    idCustomizado: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await criarNovoMaterial({
      nome: formData.nome,
      categoria: formData.categoria,
      nivelTier: parseInt(formData.nivelTier, 10),
      descricao: formData.descricao || null,
      idCustomizado: formData.idCustomizado || null,
    });

    setIsSubmitting(false);

    if (result && result.success === false) {
      setErrorMsg(result.message || 'Erro desconhecido ao criar material.');
    } else {
      setSuccessMsg(`Material "${formData.nome}" criado com sucesso!`);
      // Reset form after 1.5 seconds and close
      setTimeout(() => {
        onClose(true);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border-[3px] border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beaker className="w-6 h-6 text-fuchsia-400" />
            <h2 className="font-bold text-lg text-slate-100">Criar Novo Material</h2>
          </div>
          <button 
            onClick={() => onClose(false)} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded flex items-center gap-2 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}
          
          {successMsg && (
            <div className="bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 p-3 rounded flex items-center gap-2 text-sm">
              <Beaker className="w-5 h-5 shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">Nome do Material *</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-fuchsia-500"
              placeholder="Ex: Liga de Cobalto"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">Categoria *</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-fuchsia-500"
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
              >
                <option value="MINERIO_BRUTO">Minério Bruto</option>
                <option value="REFINADO">Refinado</option>
                <option value="COMPONENTE">Componente</option>
                <option value="ENERGIA">Energia</option>
                <option value="TECNOLOGIA_3DET">Tecnologia 3DET</option>
              </select>
            </div>
            
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">Tier (Nível) *</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-fuchsia-500"
                value={formData.nivelTier}
                onChange={e => setFormData({...formData, nivelTier: e.target.value})}
              >
                <option value="1">Tier 1 (Básico)</option>
                <option value="2">Tier 2 (Avançado)</option>
                <option value="3">Tier 3 (Raro/Complexo)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">Descrição (Opcional)</label>
            <textarea 
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-fuchsia-500 h-20 resize-none"
              placeholder="Descreva as propriedades do material..."
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">ID Customizado (Opcional)</label>
            <input 
              type="text" 
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-fuchsia-500 font-mono text-sm"
              placeholder="Ex: MAT_LIGA_COBALTO"
              value={formData.idCustomizado}
              onChange={e => setFormData({...formData, idCustomizado: e.target.value})}
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Deixe em branco para auto-gerar baseado no nome.</span>
          </div>

          <div className="pt-4 border-t border-slate-700/50 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || successMsg}
              className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2 rounded font-bold shadow-lg shadow-fuchsia-900/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Criar Material
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
