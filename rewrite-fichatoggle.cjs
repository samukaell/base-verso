const fs = require('fs');
let c = fs.readFileSync('src/components/FichaNode.jsx', 'utf8');

c = c.replace(
  'width = 250, \n    height = 150 \n  } = data;',
  'width = 250, \n    height = 150,\n    onToggleTrouble\n  } = data;'
);

c = c.replace(
  '<div className="bg-black/90 p-1.5 flex items-center justify-center gap-2 border-t-2" style={{ borderColor: \'#80100a\' }}>',
  '<button onClick={(e) => { e.stopPropagation(); onToggleTrouble && onToggleTrouble(data.id); }} className="w-full bg-black/90 hover:bg-black/70 p-1.5 flex items-center justify-center gap-2 border-t-2 transition-colors cursor-pointer" style={{ borderColor: \'#80100a\' }}>'
);

c = c.replace(
  '{isOperando ? "SISTEMA ATIVO" : "SISTEMA OFFLINE"}\n              </span>\n            </div>',
  '{isOperando ? "SISTEMA ATIVO" : "SISTEMA OFFLINE"}\n              </span>\n            </button>'
);

fs.writeFileSync('src/components/FichaNode.jsx', c);
