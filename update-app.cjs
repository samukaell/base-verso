const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

if (!c.includes('CreateFichaModal')) {
  c = c.replace(/import CreateSectorModal from '\.\/components\/CreateSectorModal';/, "import CreateSectorModal from './components/CreateSectorModal';\nimport CreateFichaModal from './components/CreateFichaModal';");
  
  c = c.replace(/const \[pendingNewSector, setPendingNewSector\] = useState\(null\);/, "const [pendingNewSector, setPendingNewSector] = useState(null);\n  const [pendingNewFicha, setPendingNewFicha] = useState(null);");

  c = c.replace(/onCreateClick: \(\) => setPendingNewSector\(\{ x: layout\.x, y: layout\.y \}\)/g, "onCreateClick: () => setPendingNewSector({ x: layout.x, y: layout.y }),\n                    onCreateFichaClick: () => setPendingNewFicha({ x: layout.x, y: layout.y })");

  c = c.replace(/onCreateClick: \(\) => setPendingNewSector\(\{ x: fl\.x, y: fl\.y \}\)/g, "onCreateClick: () => setPendingNewSector({ x: fl.x, y: fl.y }),\n                        onCreateFichaClick: () => setPendingNewFicha({ x: fl.x, y: fl.y })");

  const modalJsx = `
      {pendingNewFicha && (
        <CreateFichaModal 
          baseId={baseId}
          defaultX={pendingNewFicha.x}
          defaultY={pendingNewFicha.y}
          onClose={() => setPendingNewFicha(null)}
        />
      )}
`;
  
  c = c.replace(/\{pendingNewSector && \([\s\S]*?<\/CreateSectorModal>\n\s*\)\}/, "$&\n" + modalJsx);

  fs.writeFileSync('src/App.jsx', c);
  console.log('App.jsx updated!');
} else {
  console.log('Already updated!');
}
