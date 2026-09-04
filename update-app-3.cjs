const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const target = `        {pendingNewSector && (
          <CreateSectorModal 
            baseId={baseId}
            defaultX={pendingNewSector.x}
            defaultY={pendingNewSector.y}
            onClose={(shouldReload) => {
              setPendingNewSector(null);
              if (shouldReload) loadData();
            }}
          />
        )}`;

const replacement = `        {pendingNewSector && (
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

if (c.includes(target) && !c.includes('pendingNewFicha &&')) {
  c = c.replace(target, replacement);
  fs.writeFileSync('src/App.jsx', c);
  console.log('App.jsx updated correctly.');
} else {
  console.log('Could not find target or already applied.');
}
