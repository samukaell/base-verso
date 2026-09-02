const fs = require('fs');
let c = fs.readFileSync('src/components/DetailsPanel.jsx', 'utf8');

c = c.replace(
  /<button\s+onClick=\{\(\) => setShowAddInstallation\(true\)\}\s+className=\"text-amber-500 hover:text-amber-300 transition-colors p-1\"\s+title=\"Adicionar Instalação \(Fábrica, Armazém, Energia\)\"\s*>\s*<Plus className=\"w-5 h-5\" \/>\s*<\/button>/,
  (match) => '{!isFicha && (\n' + match + '\n)}'
);

fs.writeFileSync('src/components/DetailsPanel.jsx', c);
