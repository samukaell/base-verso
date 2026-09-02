const fs = require('fs');
let c = fs.readFileSync('src/components/DetailsPanel.jsx', 'utf8');

c = c.replace(
  "const hasTrouble = data.status !== 'OPERANDO' && data.status !== 'Sem energia';",
  "const isFicha = node.type === 'ficha';\n  const hasTrouble = isFicha \n    ? (data.status !== 'ATIVO' && data.status !== 'OPERANDO') \n    : (data.status !== 'OPERANDO' && data.status !== 'Sem energia' && data.status !== 'SEM_ENERGIA');"
);

c = c.replace(
  'hasTrouble ? "bg-red-500/20" : "bg-sky-900/20"',
  'hasTrouble ? "bg-red-500/20" : (isFicha ? "bg-[#f04842]/20" : "bg-sky-900/20")'
);

c = c.replace(
  '<Activity className="w-5 h-5 text-sky-400" />',
  '<Activity className={cn("w-5 h-5", isFicha ? "text-[#f04842]" : "text-sky-400")} />'
);

c = c.replace(
  'span className={cn("text-xs font-bold", hasTrouble ? "text-red-400" : "text-emerald-400")}',
  'span className={cn("text-xs font-bold", hasTrouble ? "text-red-400" : (isFicha ? "text-[#f04842]" : "text-emerald-400"))}'
);

c = c.replace(
  '{hasTrouble && (\n          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">',
  '{hasTrouble && !isFicha && (\n          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3 mb-6">'
);

c = c.replace(
  'Este setor não irá gerar produção nem processar rotas logísticas enquanto estiver neste estado.</p>\n            </div>\n          </div>\n        )}',
  'Este setor não irá gerar produção nem processar rotas logísticas enquanto estiver neste estado.</p>\n            </div>\n          </div>\n        )}\n\n        {isFicha && (\n          <div className="bg-black/40 border border-[#f04842]/30 rounded-lg p-3 flex flex-col gap-2 mb-6">\n            <div className="flex items-center gap-2 mb-1">\n              <Zap className="w-4 h-4 text-amber-400" />\n              <h4 className="text-sm font-bold text-amber-400">Consumo de Energia (Base Central)</h4>\n            </div>\n            <div className="text-xs text-slate-300">\n              Esta ficha extrai <span className="font-bold text-amber-400">{data.energia_requerida_kwh || 0} kWh</span> diretamente da reserva principal da base.\n            </div>\n          </div>\n        )}'
);

c = c.replace(
  'hasTrouble \n              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/20" \n              : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20"',
  'hasTrouble \n              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/20" \n              : (isFicha ? "bg-[#f04842] hover:bg-red-400 text-white shadow-red-500/20" : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20")'
);

c = c.replace(
  '{hasTrouble ? "Restaurar Operações" : "Interditar Setor"}',
  '{hasTrouble ? (isFicha ? "Ativar Defesa" : "Restaurar Operações") : (isFicha ? "Desativar Defesa" : "Interditar Setor")}'
);

c = c.replace(
  '<button \n          onClick={() => handleRemoverSetor(node.id)}\n          className="w-full font-bold py-2 px-4 rounded-lg transition-all border border-red-900 text-red-500 hover:bg-red-950 hover:text-red-400 flex items-center justify-center gap-2 text-sm mt-2"\n        >\n          <Trash2 className="w-4 h-4" /> Destruir Setor Definitivamente\n        </button>',
  '{!isFicha && (\n          <button \n            onClick={() => handleRemoverSetor(node.id)}\n            className="w-full font-bold py-2 px-4 rounded-lg transition-all border border-red-900 text-red-500 hover:bg-red-950 hover:text-red-400 flex items-center justify-center gap-2 text-sm mt-2"\n          >\n            <Trash2 className="w-4 h-4" /> Destruir Setor Definitivamente\n          </button>\n        )}'
);

c = c.replace(
  '<button \n            onClick={() => setShowAddInstallation(true)}\n            className="text-amber-500 hover:text-amber-300 transition-colors p-1"\n            title="Adicionar Instalação (Fábrica, Armazém, Energia)"\n          >\n            <Plus className="w-5 h-5" />\n          </button>',
  '{!isFicha && (\n            <button \n              onClick={() => setShowAddInstallation(true)}\n              className="text-amber-500 hover:text-amber-300 transition-colors p-1"\n              title="Adicionar Instalação (Fábrica, Armazém, Energia)"\n            >\n              <Plus className="w-5 h-5" />\n            </button>\n          )}'
);

fs.writeFileSync('src/components/DetailsPanel.jsx', c);
