import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

modalJsx = """        {pendingNewFicha && (
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
    # Check if already added
    if "pendingNewFicha &&" not in c[match.start():match.end()+300]:
        c = c[:match.end()] + '\n\n' + modalJsx + c[match.end():]
        with open('src/App.jsx', 'w', encoding='utf-8') as f:
            f.write(c)
        print("Success! Appended after CreateSectorModal")
    else:
        print("Already present!")
else:
    print("Could not find CreateSectorModal block!")
