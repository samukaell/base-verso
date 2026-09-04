with open('src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

target = """        {pendingNewSector && (
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
      </div>
    );
  }
  const AnimatedCityBackground = () => {"""

replacement = """        {pendingNewSector && (
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
        )}
      </div>
    );
  }
  const AnimatedCityBackground = () => {"""

c = c.replace(target, replacement)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Python fix done!")
