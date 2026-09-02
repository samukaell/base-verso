const fs = require('fs');
let c = fs.readFileSync('src/components/DetailsPanel.jsx', 'utf8');

c = c.replace(
  '{!(data.distritos_energia?.length > 0) && (',
  '{!isFicha && !(data.distritos_energia?.length > 0) && ('
);

c = c.replace(
  'Esta ficha extrai <span className="font-bold text-amber-400">{data.energia_requerida_kwh || 0} kWh</span> diretamente da reserva principal da base.',
  'Esta ficha requer <span className="font-bold text-amber-400">{data.energia_requerida_kwh || 0} kWh</span> diretamente da reserva principal da base para estar operando.'
);

fs.writeFileSync('src/components/DetailsPanel.jsx', c);
