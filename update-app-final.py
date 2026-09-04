import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Remove from isLoading block
bad_block = re.search(r'\s*\{pendingNewFicha && \([\s\S]*?<\/CreateFichaModal>\s*\)\}', c[:c.find('return (')])
if bad_block:
    c = c[:bad_block.start()] + c[bad_block.end():]

# 2. Add to the correct place
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
if match and "pendingNewFicha &&" not in c[match.start():match.end()+200]:
    c = c[:match.end()] + modalJsx + c[match.end():]
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed via python")
else:
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Removed bad block, maybe couldn't find good block")
