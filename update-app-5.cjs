const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(/         \{pendingNewFicha && \([\s\S]*?<\/CreateFichaModal>\n            \)\}\n/, '');

const modalJsx = `        {pendingNewSector && (
          <CreateSectorModal 
            baseId={baseId}
            defaultX={pendingNewSector.x}
            defaultY={pendingNewSector.y}
            onClose={(shouldReload) => {
              setPendingNewSector(null);
              if (shouldReload) loadData();
            }}
          />
        )}
        
        {pendingNewFicha && (
          <CreateFichaModal 
            baseId={baseId}
            defaultX={pendingNewFicha.x}
            defaultY={pendingNewFicha.y}
            onClose={() => setPendingNewFicha(null)}
          />
        )}`;

c = c.replace(/        \{pendingNewSector && \([\s\S]*?<\/CreateSectorModal>\n\s*\)\}/, modalJsx);

fs.writeFileSync('src/App.jsx', c);
console.log('Fixed rendering!');
