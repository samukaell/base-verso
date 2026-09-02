const fs = require('fs');
let c = fs.readFileSync('src/components/DetailsPanel.jsx', 'utf8');

const regexBody = /(<div className="flex-grow overflow-y-auto custom-scrollbar p-4 relative">)([\s\S]*?)(<div className="p-4 border-t border-slate-700\/50 bg-slate-800\/80 flex flex-col gap-2">)/;

c = c.replace(regexBody, (match, p1, p2, p3) => {
  return p1 + `

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
` + p2 + `
          </>
        )}

` + p3;
});

fs.writeFileSync('src/components/DetailsPanel.jsx', c);
