import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

modalJsx = """
        {pendingNewFicha && (
          <CreateFichaModal 
            baseId={baseId}
            defaultX={pendingNewFicha.x}
            defaultY={pendingNewFicha.y}
            onClose={() => setPendingNewFicha(null)}
          />
        )}
"""

pattern = r'(<CreateSectorModal[\s\S]*?<\/CreateSectorModal>\s*\)\})'
match = re.search(pattern, c)

if match:
    c = c[:match.end()] + modalJsx + c[match.end():]
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed!")
else:
    print("COULD NOT FIND CreateSectorModal block")
