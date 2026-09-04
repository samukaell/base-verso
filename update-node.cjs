const fs = require('fs');
let c = fs.readFileSync('src/components/SectorNode.jsx', 'utf8');

if (!c.includes('FileText')) {
  c = c.replace(/import \{ (.*?) \} from 'lucide-react';/, "import { $1, FileText } from 'lucide-react';");
}

const emptyState = `
  if (data.isEmpty) {
    return (
      <div 
        style={{ width: data.width || 250, height: data.height || 150, backgroundColor: '#708066' }}
        className="border-[6px] border-black flex items-center justify-center gap-10 shadow-sm"
      >
        {/* Add Sector Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); data.onCreateClick && data.onCreateClick(); }}
          className="text-white font-bold text-5xl opacity-50 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
          title="Criar Setor"
        >
          +
        </button>

        {/* Add Ficha Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); data.onCreateFichaClick && data.onCreateFichaClick(); }}
          className="text-white opacity-50 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
          title="Criar Ficha"
        >
          <FileText size={40} />
        </button>
      </div>
    );
  }
`;

c = c.replace(/if \(data\.isEmpty\) \{[\s\S]*?\}\n\n/m, emptyState + '\n\n');

fs.writeFileSync('src/components/SectorNode.jsx', c);
