import React, { useState, useEffect } from 'react';
import { X, Wrench, Save, RefreshCw, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { listarTodosMateriais, cadastrarReceita } from '../request/request';

export default function CreateRecipeModal({ baseId, onClose }) {
  const [materiais, setMateriais] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    nomeReceita: '',
    materialSaidaId: '',
    quantidadeSaida: 1,
    tempoCiclo: 1,
    energiaKwh: 500,
    ingredientes: []
  });

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await listarTodosMateriais();
      if (data && Array.isArray(data.materiais)) {
        setMateriais(data.materiais);
      } else if (Array.isArray(data)) {
        setMateriais(data);
      }
      setIsLoading(false);
    }
    if (baseId) {
      load();
    }
  }, [baseId]);

  const addIngrediente = () => {
    setFormData({
      ...formData,
      ingredientes: [...formData.ingredientes, { material_id: '', quantidade: 1 }]
    });
  };

  const removeIngrediente = (index) => {
    const novos = [...formData.ingredientes];
    novos.splice(index, 1);
    setFormData({ ...formData, ingredientes: novos });
  };

  const updateIngrediente = (index, field, value) => {
    const novos = [...formData.ingredientes];
    novos[index][field] = value;
    setFormData({ ...formData, ingredientes: novos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materialSaidaId) {
      setErrorMsg("Selecione o material que será produzido.");
      return;
    }
    
    // Validate ingredients
    const validIngredients = formData.ingredientes.filter(i => i.material_id && Number(i.quantidade) > 0);
    if (validIngredients.length === 0) {
      setErrorMsg("Adicione pelo menos 1 ingrediente válido (material e quantidade > 0).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await cadastrarReceita({
      nomeReceita: formData.nomeReceita,
      materialSaidaId: formData.materialSaidaId,
      quantidadeSaida: parseFloat(formData.quantidadeSaida),
      tempoCiclo: parseFloat(formData.tempoCiclo),
      energiaKwh: parseFloat(formData.energiaKwh),
      ingredientes: validIngredients.map(i => ({ material_id: i.material_id, quantidade: parseFloat(i.quantidade) }))
    });

    setIsSubmitting(false);

    if (result.error) {
      setErrorMsg(result.error.message || 'Erro desconhecido ao criar processo.');
    } else {
      setSuccessMsg(`Processo "${formData.nomeReceita}" criado com sucesso!`);
      setTimeout(() => {
        onClose(true);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border-[3px] border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-sky-400" />
            <h2 className="font-bold text-lg text-slate-100">Criar Novo Processo (Receita)</h2>
          </div>
          <button onClick={() => onClose(false)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
            <p>Carregando materiais disponíveis...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
            {errorMsg && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded flex items-center gap-2 text-sm shrink-0">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 p-3 rounded flex items-center gap-2 text-sm shrink-0">
                <Wrench className="w-5 h-5 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">Nome do Processo *</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-sky-500"
                  placeholder="Ex: Refino de Titânio"
                  value={formData.nomeReceita}
                  onChange={e => setFormData({...formData, nomeReceita: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">Material Produzido *</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-sky-500"
                  value={formData.materialSaidaId}
                  required
                  onChange={e => setFormData({...formData, materialSaidaId: e.target.value})}
                >
                  <option value="" disabled>Selecione...</option>
                  {materiais.filter(m => m.categoria !== 'MINERIO_BRUTO').map(m => (
                    <option key={m.material_id} value={m.material_id}>
                      {m.nome_material}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">Qtd. Produzida (Ton) *</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  min="0.1"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-sky-500"
                  value={formData.quantidadeSaida}
                  onChange={e => setFormData({...formData, quantidadeSaida: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">Tempo de Ciclo (Horas) *</label>
                <input 
                  type="number" 
                  step="0.5"
                  required
                  min="0.5"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-sky-500"
                  value={formData.tempoCiclo}
                  onChange={e => setFormData({...formData, tempoCiclo: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">Energia Requerida (kWh) *</label>
                <input 
                  type="number" 
                  step="10"
                  required
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-sky-500"
                  value={formData.energiaKwh}
                  onChange={e => setFormData({...formData, energiaKwh: e.target.value})}
                />
              </div>
            </div>

            <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-slate-300 text-sm font-bold uppercase tracking-wider">Ingredientes</label>
                <button 
                  type="button"
                  onClick={addIngrediente}
                  className="flex items-center gap-1 text-xs bg-sky-600/20 text-sky-400 hover:bg-sky-600/40 px-2 py-1 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              {formData.ingredientes.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-4">Nenhum ingrediente adicionado. Clique em "Adicionar".</p>
              ) : (
                <div className="space-y-2">
                  {formData.ingredientes.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select 
                        className="flex-1 bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-sky-500 text-sm"
                        value={ing.material_id}
                        onChange={e => updateIngrediente(idx, 'material_id', e.target.value)}
                        required
                      >
                        <option value="" disabled>Selecione um material...</option>
                        {materiais.map(m => (
                          <option key={m.material_id} value={m.material_id}>
                            {m.nome_material}
                          </option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        min="0.1"
                        placeholder="Qtd (Ton)"
                        className="w-24 bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-sky-500 text-sm text-center"
                        value={ing.quantidade}
                        onChange={e => updateIngrediente(idx, 'quantidade', e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => removeIngrediente(idx)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 shrink-0">
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
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded font-bold shadow-lg shadow-sky-900/20 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Criar Processo
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
