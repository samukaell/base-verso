import React, { useState, useRef } from 'react';
import { X, Zap, ZapOff, Box, Layers, Factory as FactoryIcon, Settings, Plus, ArrowRight, Database, Factory, Activity, Trash2, ShieldAlert, Truck, Play, Pause } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import FactoryControlModal from './FactoryControlModal';
import AddInstallationModal from './AddInstallationModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import TransferStockModal from './TransferStockModal';
import { deletarFabrica, deletarArmazenamento, deletarEnergia, deletarSetor } from '../services/deleteService';
import { reativarProcesso, definirProvedorEnergia, updateSetorStatus } from '../request/request';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function DetailsPanel({ baseId, node, providerNode, onClose, onToggleTrouble, nodes, edges }) {
  const [expandedSilos, setExpandedSilos] = useState({});
  const [controllingFactory, setControllingFactory] = useState(null);
  const [showAddInstallation, setShowAddInstallation] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [transferState, setTransferState] = useState(null); // { armazem, item }
  const [errorDialog, setErrorDialog] = useState(null);
  const [processosSetor, setProcessosSetor] = useState([]);
  const siloRefs = useRef({});

  React.useEffect(() => {
    if (baseId && node?.id) {
      import('../request/request').then(({ listarTodosProcessosBase }) => {
        listarTodosProcessosBase(baseId).then(res => {
          if (res && res.processos) {
            setProcessosSetor(res.processos.filter(p => p.setor?.id === node.id));
          } else if (Array.isArray(res)) {
            setProcessosSetor(res.filter(p => p.setor?.id === node.id));
          } else {
            setProcessosSetor([]);
          }
        });
      });
    }
  }, [baseId, node?.id]);

  const toggleSilo = (siloId) => {
    const willExpand = !expandedSilos[siloId];
    setExpandedSilos(prev => ({ ...prev, [siloId]: willExpand }));

    if (willExpand) {
      setTimeout(() => {
        if (siloRefs.current[siloId]) {
          siloRefs.current[siloId].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  const handleRemoverFabrica = (id) => {
    setDeleteDialog({
      title: "Destruir Fábrica",
      message: "Tem certeza que deseja desmantelar esta fábrica? Todos os processos ativos serão interrompidos e a estrutura será perdida permanentemente.",
      action: async () => await deletarFabrica(id)
    });
  };

  const handleRemoverArmazenamento = (id) => {
    setDeleteDialog({
      title: "Destruir Armazém",
      message: "Tem certeza que deseja destruir este armazém? A capacidade de armazenamento e os itens estocados aqui poderão ser perdidos.",
      action: async () => await deletarArmazenamento(id)
    });
  };

  const handleRemoverEnergia = (id) => {
    setDeleteDialog({
      title: "Destruir Gerador",
      message: "Destruir este gerador removerá imediatamente sua capacidade da rede elétrica do setor. Setores dependentes poderão sofrer apagões. Confirmar?",
      action: async () => await deletarEnergia(id)
    });
  };

  const handleRemoverSetor = (id) => {
    setDeleteDialog({
      title: "Protocolo de Destruição Total",
      message: "ATENÇÃO! Tem certeza que deseja destruir o setor inteiro? Isso apagará a estrutura, fábricas, silos e geradores presentes nele de forma IRREVERSÍVEL.",
      action: async () => await deletarSetor(id)
    });
  };

  const handleDefinirProvedor = async (e) => {
    const selectedProviderId = e.target.value === "" ? null : e.target.value;
    const result = await definirProvedorEnergia(node?.id, selectedProviderId);
    
    if (result && result.success !== false) {
      if (selectedProviderId) {
        await updateSetorStatus(node.id, 'OPERANDO');
      } else {
        await updateSetorStatus(node.id, 'SEM_ENERGIA');
      }
      window.location.reload();
    } else {
      alert("Erro ao alterar provedor: " + (result?.message || "Erro desconhecido"));
    }
  };

  if (!node) return null;
  const { data } = node;

  const isFicha = node.type === 'ficha';
  const hasTrouble = isFicha 
    ? (data.status !== 'ATIVO' && data.status !== 'OPERANDO') 
    : (data.status !== 'OPERANDO' && data.status !== 'Sem energia' && data.status !== 'SEM_ENERGIA');

  return (
    <div className="absolute top-4 right-4 bottom-4 w-[400px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col z-20 overflow-hidden">
      {/* Header */}
      <div className={cn(
        "p-4 flex items-start justify-between border-b border-slate-700/50",
        hasTrouble ? "bg-red-500/20" : (isFicha ? "bg-[#f04842]/20" : "bg-sky-900/20")
      )}>
        <div className="flex gap-3">
          <div className="mt-1">
            <Activity className={cn("w-5 h-5", isFicha ? "text-[#f04842]" : "text-sky-400")} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-100 leading-tight">{data.nome}</h2>
            <span className={cn("text-xs font-bold", hasTrouble ? "text-red-400" : (isFicha ? "text-[#f04842]" : "text-emerald-400"))}>
              Status: {data.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowAddInstallation(true)}
            className="text-amber-500 hover:text-amber-300 transition-colors p-1"
            title="Adicionar Instalação (Fábrica, Armazém, Energia)"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        {isFicha && (
          <div className="space-y-4 mb-6">
            <div className="bg-black/40 border border-[#f04842]/30 rounded-lg p-3">
              <h4 className="text-xs uppercase font-bold text-[#f04842] mb-1">Descrição</h4>
              <p className="text-xs text-slate-300">{data.descricao || "Unidade de defesa sem descrição disponível."}</p>
            </div>

            <div className="bg-black/40 border border-[#f04842]/30 rounded-lg p-3">
              <h4 className="text-xs uppercase font-bold text-[#f04842] mb-2 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Atributos de Combate
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                  <span className="text-xs text-slate-400">Força</span>
                  <span className="text-xs font-bold text-slate-200">{data.atributos?.forca || 0}</span>
                </div>
                <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                  <span className="text-xs text-slate-400">Poder</span>
                  <span className="text-xs font-bold text-slate-200">{data.atributos?.poder || 0}</span>
                </div>
                <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                  <span className="text-xs text-slate-400">Armadura</span>
                  <span className="text-xs font-bold text-slate-200">{data.atributos?.armadura || 0}</span>
                </div>
                <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                  <span className="text-xs text-slate-400">Habilidade</span>
                  <span className="text-xs font-bold text-slate-200">{data.atributos?.habilidade || 0}</span>
                </div>
                <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                  <span className="text-xs text-slate-400">Resistência</span>
                  <span className="text-xs font-bold text-slate-200">{data.atributos?.resistencia || 0}</span>
                </div>
              </div>
            </div>

            {(data.skills?.length > 0) && (
              <div className="bg-black/40 border border-[#f04842]/30 rounded-lg p-3">
                <h4 className="text-xs uppercase font-bold text-[#f04842] mb-2">Habilidades (Skills)</h4>
                <div className="flex flex-col gap-1">
                  {data.skills.map((s, i) => (
                    <span key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-[#f04842] rounded-full"></div> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {(data.vantagens?.length > 0) && (
                <div className="bg-black/40 border border-[#f04842]/30 rounded-lg p-3">
                  <h4 className="text-xs uppercase font-bold text-emerald-400 mb-2">Vantagens</h4>
                  <div className="flex flex-col gap-1">
                    {data.vantagens.map((v, i) => (
                      <span key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-emerald-400 rounded-full"></div> {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(data.desvantagens?.length > 0) && (
                <div className="bg-black/40 border border-[#f04842]/30 rounded-lg p-3">
                  <h4 className="text-xs uppercase font-bold text-red-400 mb-2">Desvantagens</h4>
                  <div className="flex flex-col gap-1">
                    {data.desvantagens.map((d, i) => (
                      <span key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-red-400 rounded-full"></div> {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-black/40 border border-[#f04842]/30 rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-amber-400">Consumo de Energia (Base Central)</h4>
              </div>
              <div className="text-xs text-slate-300">
                Esta ficha requer <span className="font-bold text-amber-400">{data.energia_requerida_kwh || 0} kWh</span> diretamente da reserva principal da base para estar operando.
              </div>
            </div>
          </div>
        )}

        {!isFicha && (
          <>


        {/* Player / Base Info */}
        {data.playerInfo && (
          <div className="bg-sky-900/30 border border-sky-500/30 rounded-lg p-3 flex flex-col gap-1">
            <h3 className="text-xs uppercase tracking-wider text-sky-400 font-bold mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Centro de Comando
            </h3>
            <p className="text-xs text-slate-300 flex justify-between">
              <span>Comandante:</span> 
              <span className="text-white font-bold">{data.playerInfo.nome}</span>
            </p>
            <p className="text-xs text-slate-300 flex justify-between">
              <span>ID Jogador:</span> 
              <span className="font-mono text-sky-300">{data.playerInfo.id}</span>
            </p>
            <p className="text-xs text-slate-300 flex justify-between">
              <span>ID Base:</span> 
              <span className="font-mono text-sky-300">{data.playerInfo.baseId}</span>
            </p>
          </div>
        )}
        
        {/* Status Alert */}
        {hasTrouble && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-400">Setor Paralisado</h4>
              <p className="text-xs text-red-300/80 mt-1">Este setor não irá gerar produção nem processar rotas logísticas enquanto estiver neste estado.</p>
            </div>
          </div>
        )}

        {/* Distritos de Energia ou Energia Recebida */}
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Geração e Fornecimento de Energia
          </h3>
          <div className="space-y-3">
            
            {/* Selector de Provedor (Apenas para setores sem geração própria) */}
            {!isFicha && !(data.distritos_energia?.length > 0) && (
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Conectar a Provedor</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded text-sm outline-none focus:border-sky-500"
                  value={data.setor_energia_provedor_id || ""}
                  onChange={handleDefinirProvedor}
                >
                  <option value="">Sem Energia (Inativo)</option>
                  {nodes
                    .filter(n => !n.data.isEmpty && n.data.distritos_energia?.length > 0)
                    .map(n => (
                      <option key={n.id} value={n.id}>
                        {n.data.nome} (Livre: {Number(n.data.restante_kwh_hora || 0).toFixed(0)} kWh)
                      </option>
                  ))}
                </select>
              </div>
            )}
              
              {/* Barra de Energia Restante (Se o Setor for Provedor) */}
              {data.restante_kwh_hora != null && Number(data.producao_kwh_hora) > 0 && (
                <div className="bg-slate-800/50 p-3 rounded-lg border border-emerald-900/50 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-200">Capacidade da Matriz</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-emerald-400 font-bold">Provedor</span>
                  </div>
                  
                  {(() => {
                    const totalProducao = Number(data.producao_kwh_hora) || 0;
                    const restante = Number(data.restante_kwh_hora) || 0;
                    const consumido = Math.max(0, totalProducao - restante);
                    const pctRestante = totalProducao > 0 ? Math.max(0, Math.min(100, (restante / totalProducao) * 100)) : 0;
                    const pctConsumido = 100 - pctRestante;

                    return (
                      <div className="mb-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Consumo da Rede</span>
                          <span className="text-emerald-400 font-mono">{restante.toFixed(0)} kWh Livres</span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 flex">
                          <div 
                            className="h-full transition-all duration-500 bg-red-500/80"
                            style={{ width: `${pctConsumido}%` }}
                            title={`Consumido: ${consumido.toFixed(0)} kWh`}
                          />
                          <div 
                            className="h-full transition-all duration-500 bg-emerald-500"
                            style={{ width: `${pctRestante}%` }}
                            title={`Livre: ${restante.toFixed(0)} kWh`}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
                          <span>0</span>
                          <span>Máx: {totalProducao.toFixed(0)} kWh</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {data.setor_energia_provedor_id && data.setor_energia_provedor_id !== data.id && (
                <div className="bg-slate-800/50 p-3 rounded-lg border border-sky-900/50">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-slate-200">Rede Externa</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-300">Recebendo</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Provedor: <span className="font-mono text-sky-300">{data.setor_energia_provedor_id}</span></span>
                    {data.energia_recebida_kwh && (
                      <span className="text-emerald-400 font-mono">+{data.energia_recebida_kwh} kWh</span>
                    )}
                  </div>

                  {/* Mostra saldo de energia do provedor */}
                  {providerNode && providerNode.data.restante_kwh_hora != null && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 uppercase">Capacidade Livre na Rede:</span>
                        <span className="text-emerald-400 font-bold font-mono">{Number(providerNode.data.restante_kwh_hora).toFixed(0)} kWh</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {data.distritos_energia?.map((eng) => (
                <div key={eng.id} className="bg-slate-800/50 p-3 rounded-lg border border-emerald-900/50 relative group">
                  <button 
                    onClick={() => handleRemoverEnergia(eng.id)}
                    className="absolute top-2 right-2 p-1 text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 rounded"
                    title="Destruir Gerador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex justify-between items-start mb-1 pr-6">
                    <span className="text-sm font-bold text-slate-200">{eng.nome}</span>
                    <span className="text-xs text-emerald-400 font-mono">{eng.producao_kwh_hora} kWh</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Tipo: {eng.tipo_geracao}</span>
                    <span>Eficiência: {eng.eficiencia_percentual}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Fábricas e Processos */}
        {data.fabricas && data.fabricas.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-purple-400 font-bold mb-3 flex items-center gap-2">
              <Factory className="w-4 h-4" /> Complexo Industrial
            </h3>
            <div className="space-y-4">
              {data.fabricas.map((fab) => (
                <div key={fab.id} className="bg-slate-800/50 p-3 rounded-lg border border-purple-900/50 relative group">
                  <button 
                    onClick={() => handleRemoverFabrica(fab.id)}
                    className="absolute top-2 right-2 p-1 text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 rounded"
                    title="Destruir Fábrica"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex justify-between items-start mb-2 pr-6">
                    <span className="text-sm font-bold text-slate-200">{fab.nome_fabrica}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-300">{fab.tipo_fabrica}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3">Energia Requerida: {fab.energia_requerida_kwh} kWh</div>
                  
                  {processosSetor.filter(p => p.fabrica?.id === fab.id).length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-xs text-slate-500 uppercase">Processos Ativos</span>
                      {processosSetor.filter(p => p.fabrica?.id === fab.id).map((proc) => (
                        <div key={proc.processo_id} className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                            <span className="truncate pr-2 uppercase">Produção: {proc.produto_saida?.nome_material || 'Material'}</span>
                            <span className={proc.status_processo === 'EM_ANDAMENTO' ? 'text-emerald-400' : 'text-amber-400'}>
                              {proc.status_processo}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2 font-mono">
                            {proc.insumo_entrada && (
                              <span className="text-red-400">-{proc.insumo_entrada.quantidade_entrada} {proc.insumo_entrada.nome_material}</span>
                            )}
                            {(!proc.insumo_entrada) && <span>Extração direta</span>}
                            <span className="text-emerald-400">+{proc.produto_saida?.quantidade_saida || 0} {proc.produto_saida?.nome_material}</span>
                          </div>

                          <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-[9px] text-slate-500">
                            <span>Início: {new Date(proc.tempo?.inicio).toLocaleTimeString()}</span>
                            <span>Loop: {proc.em_loop ? 'Ativo' : 'Não'}</span>
                          </div>

                          <div className="flex justify-end gap-2 mt-2">
                            {proc.status_processo === 'EM_ANDAMENTO' && (
                              <button 
                                onClick={async (e) => {
                                  const btn = e.currentTarget;
                                  btn.disabled = true;
                                  import('../request/request').then(({ interromperProcesso }) => {
                                    interromperProcesso(proc.processo_id, 'PAUSADO').then(res => {
                                      if (res && res.success !== false) {
                                        window.location.reload();
                                      } else {
                                        setErrorDialog("Erro ao interromper: " + (res?.message || "Erro desconhecido"));
                                        btn.disabled = false;
                                      }
                                    });
                                  });
                                }}
                                className="flex items-center gap-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-400 px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                                title="Pausar este processo"
                              >
                                <Pause className="w-3 h-3" /> Pausar
                              </button>
                            )}

                            {(proc.status_processo !== 'EM_ANDAMENTO' && proc.status_processo !== 'CONCLUIDO') && (
                              <button 
                                onClick={async (e) => {
                                  const btn = e.currentTarget;
                                  btn.disabled = true;
                                  import('../request/request').then(({ reativarProcesso }) => {
                                    reativarProcesso(proc.processo_id, true).then(res => {
                                      if (res && res.success !== false) {
                                        window.location.reload();
                                      } else {
                                        setErrorDialog("Erro ao reativar: " + (res?.message || "Erro desconhecido"));
                                        btn.disabled = false;
                                      }
                                    });
                                  });
                                }}
                                className="flex items-center gap-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                                title={proc.status_processo === 'PAUSADO' ? 'Retomar processo pausado' : 'Forçar reativação do processo'}
                              >
                                <Play className="w-3 h-3" /> {proc.status_processo === 'PAUSADO' ? 'Retomar' : 'Reativar'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">Sem processos ativos no momento.</div>
                  )}

                  <button
                    onClick={() => setControllingFactory(fab)}
                    className="w-full mt-3 bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-purple-300 hover:text-purple-200 text-xs py-1.5 rounded transition-colors flex justify-center items-center gap-1 font-bold"
                  >
                    <Factory className="w-3 h-3" /> Painel da Fábrica
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Silos de Armazenamento */}
        {data.distritos_armazenamento && data.distritos_armazenamento.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" /> Distritos de Armazenamento
            </h3>
            <div className="space-y-3">
              {data.distritos_armazenamento.map((arm) => {
                const max = arm.capacidade_maxima_ton || 0;
                // Usa o novo campo se existir, senão faz fallback pro cálculo manual
                const rawRestante = typeof arm.espaco_restante_ton === 'number' 
                  ? arm.espaco_restante_ton 
                  : max - (arm.itens_armazenados?.reduce((acc, curr) => acc + (curr.quantidade_atual_ton || 0), 0) || 0);
                const restante = Math.max(0, rawRestante);
                const overcapacity = rawRestante < 0 ? Math.abs(rawRestante) : 0;
                const consumido = Math.max(0, max - rawRestante);
                const pctConsumido = max > 0 ? Math.min(100, Math.max(0, (consumido / max) * 100)) : 0;
                const pctRestante = 100 - pctConsumido;
                const isExpanded = expandedSilos[arm.id];
                
                return (
                  <div 
                    key={arm.id} 
                    ref={el => siloRefs.current[arm.id] = el}
                    className="bg-slate-800/50 rounded-lg border border-amber-900/50 overflow-hidden transition-colors relative group"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoverArmazenamento(arm.id); }}
                      className="absolute top-2 right-2 p-1 text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 rounded z-10"
                      title="Destruir Armazém"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div 
                      className="p-3 cursor-pointer hover:bg-slate-700/60 pr-8"
                      onClick={() => toggleSilo(arm.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-slate-200">{arm.nome}</span>
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">{arm.tipo_armazenamento}</span>
                      </div>
                      
                      <div className="mb-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Ocupação</span>
                          <span className={cn("font-mono", overcapacity > 0 ? "text-red-400 font-bold" : "text-amber-400")}>
                            {overcapacity > 0 ? `Lotação! (+${overcapacity.toFixed(1)} T excedentes)` : `${restante.toFixed(1)} Ton Livres`}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 flex">
                          <div 
                            className="h-full transition-all duration-500 bg-amber-500"
                            style={{ width: `${pctConsumido}%` }}
                            title={`Ocupado: ${consumido.toFixed(1)} Ton`}
                          />
                          <div 
                            className="h-full transition-all duration-500 bg-emerald-500/80"
                            style={{ width: `${pctRestante}%` }}
                            title={`Livre: ${restante.toFixed(1)} Ton`}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
                          <span>0</span>
                          <span>Máx: {max.toFixed(0)} Ton</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-[10px] text-center text-slate-500 italic">
                        {isExpanded ? '▲ Ocultar materiais' : '▼ Clique para listar materiais'}
                      </div>
                    </div>

                    {isExpanded && arm.itens_armazenados && arm.itens_armazenados.length > 0 && (
                      <div className="bg-slate-900/80 p-3 space-y-2 border-t border-slate-700/50">
                        {arm.itens_armazenados.map(item => (
                          <div key={item.id} className="flex items-center gap-2 text-xs bg-slate-800/50 p-2 rounded group">
                            <Box className="w-3 h-3 text-slate-500" />
                            <span className="flex-1 text-slate-300 truncate" title={item.nome_material}>{item.nome_material}</span>
                            <span className="text-slate-400 font-mono pr-2">{item.quantidade_atual_ton} T</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setTransferState({ armazem: arm, item }); }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-500 rounded transition-all"
                              title="Transferir Estoque para outro Setor"
                            >
                              <Truck className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      
          </>
        )}
</div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/80 flex flex-col gap-2">
        <button 
          onClick={() => onToggleTrouble(node.id)}
          className={cn(
            "w-full font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2",
            hasTrouble 
              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/20" 
              : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20"
          )}
        >
          {hasTrouble ? (isFicha ? "Ativar Defesa" : "Restaurar Operações") : (isFicha ? "Desativar Defesa" : "Interditar Setor")}
        </button>

        <button 
          onClick={() => handleRemoverSetor(node.id)}
          className="w-full font-bold py-2 px-4 rounded-lg transition-all border border-red-900 text-red-500 hover:bg-red-950 hover:text-red-400 flex items-center justify-center gap-2 text-sm mt-2"
        >
          <Trash2 className="w-4 h-4" /> Destruir Setor Definitivamente
        </button>
      </div>
      {controllingFactory && (
        <FactoryControlModal 
          baseId={baseId}
          fabrica={controllingFactory} 
          onClose={() => setControllingFactory(null)}
          onUpdate={() => {
            setControllingFactory(null);
            window.location.reload();
          }}
        />
      )}

      {showAddInstallation && (
        <AddInstallationModal 
          setorId={node.id} 
          onClose={() => setShowAddInstallation(false)} 
        />
      )}

      {deleteDialog && (
        <ConfirmDeleteModal 
          title={deleteDialog.title}
          message={deleteDialog.message}
          onConfirm={deleteDialog.action}
          onCancel={() => setDeleteDialog(null)}
        />
      )}

      {transferState && (
        <TransferStockModal 
          isOpen={!!transferState}
          onClose={() => setTransferState(null)}
          sourceArmazem={transferState.armazem}
          item={transferState.item}
          sourceSectorId={node.id}
          nodes={nodes}
          edges={edges}
        />
      )}

      {errorDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] p-4">
          <div className="bg-slate-900 border-2 border-red-900/50 rounded-lg max-w-sm w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-950 rounded-lg text-red-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 font-mono tracking-tight uppercase">Falha na Operação</h2>
            </div>
            
            <p className="text-sm text-slate-300 mb-6 font-mono leading-relaxed bg-slate-950/50 p-3 rounded border border-slate-800">
              {errorDialog}
            </p>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setErrorDialog(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded font-bold uppercase text-sm transition-colors border border-slate-700 flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Fechar Alerta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
