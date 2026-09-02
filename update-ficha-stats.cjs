const fs = require('fs');
let c = fs.readFileSync('src/components/DetailsPanel.jsx', 'utf8');

// First, add the imports for Heart, Shield, Target
if (!c.includes('Heart, Shield, Target')) {
  c = c.replace(/import \{ X, Zap/, "import { X, Zap, Heart, Shield, Target");
}

const strStart = '<div className="p-5 flex-1 overflow-y-auto space-y-6">';
const startIdx = c.indexOf(strStart);
const strEnd = '{/* Footer Actions */}';
const endIdx = c.indexOf(strEnd);

let contentBeforeFooter = c.substring(0, endIdx);
let lastDivIdx = contentBeforeFooter.lastIndexOf('</div>');

const before = c.substring(0, startIdx + strStart.length);
const body = c.substring(startIdx + strStart.length, lastDivIdx);
const after = c.substring(lastDivIdx);

// Check if it already has our injected code. Since we are rewriting the WHOLE body of the Ficha, 
// we will just extract the old "Sector body" which is inside the {!isFicha && ( <> ... </> )} block.
// Let's find {!isFicha && ( <>
let sectorBody = body;
const isFichaStart = body.indexOf('{isFicha && (');
const notFichaStart = body.indexOf('{!isFicha && (');
if (isFichaStart !== -1 && notFichaStart !== -1) {
    const afterNotFicha = body.substring(notFichaStart);
    // extract everything between <> and </>
    const openFrag = afterNotFicha.indexOf('<>');
    const closeFrag = afterNotFicha.lastIndexOf('</>');
    if (openFrag !== -1 && closeFrag !== -1) {
        sectorBody = afterNotFicha.substring(openFrag + 2, closeFrag);
    }
}

const newBody = `
        {isFicha && (
          <div className="space-y-4 mb-6">
            <div className="bg-black/40 border border-[#f04842]/30 rounded-lg p-3">
              <h4 className="text-xs uppercase font-bold text-[#f04842] mb-1">Descrição</h4>
              <p className="text-xs text-slate-300">{data.descricao || "Unidade de defesa sem descrição disponível."}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                <Heart className="w-5 h-5 text-red-500 mb-1" />
                <span className="text-[10px] uppercase font-bold text-red-400">Vida</span>
                <span className="text-lg font-bold text-slate-100">{data.atributos?.resistencia ? data.atributos.resistencia * 5 : 1}</span>
              </div>
              <div className="bg-sky-950/40 border border-sky-500/30 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                <Shield className="w-5 h-5 text-sky-500 mb-1" />
                <span className="text-[10px] uppercase font-bold text-sky-400">CA</span>
                <span className="text-lg font-bold text-slate-100">{(data.atributos?.armadura || 0) + (data.atributos?.habilidade || 0)}</span>
              </div>
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                <Target className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-[10px] uppercase font-bold text-amber-400">Ataque</span>
                <span className="text-lg font-bold text-slate-100">{(data.atributos?.poder || 0) + (data.atributos?.habilidade || 0)}</span>
              </div>
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
          <>\n${sectorBody}\n          </>
        )}
`;

fs.writeFileSync('src/components/DetailsPanel.jsx', before + newBody + after);
console.log("Successfully injected new fields.");
