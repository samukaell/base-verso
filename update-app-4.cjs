const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const modalJsx = `        {pendingNewFicha && (
          <CreateFichaModal 
            baseId={baseId}
            defaultX={pendingNewFicha.x}
            defaultY={pendingNewFicha.y}
            onClose={() => setPendingNewFicha(null)}
          />
        )}
      </div>
    );
  }`;

if (!c.includes('pendingNewFicha &&')) {
  c = c.replace(/      <\/div>\r?\n    \);\r?\n  \}/, modalJsx);
  fs.writeFileSync('src/App.jsx', c);
  console.log('App.jsx updated correctly.');
} else {
  console.log('Could not find target or already applied.');
}
