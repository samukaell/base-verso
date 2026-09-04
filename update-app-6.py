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

pattern = r'(<CreateSectorModal[^>]+>[\s\S]*?<\/CreateSectorModal>\s*\)\})'
match = re.search(pattern, c)
if match and "pendingNewFicha &&" not in c[match.end():match.end()+200]:
    c = c[:match.end()] + modalJsx + c[match.end():]
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed via regex in python")
else:
    print("Not found or already there")
