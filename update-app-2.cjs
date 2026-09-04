const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

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
console.log('Done!');
