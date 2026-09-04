import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove bad block
bad_block_pattern = r'\s*\{pendingNewFicha && \(\s*<CreateFichaModal[\s\S]*?/>\s*\)\}'
c = re.sub(bad_block_pattern, '', c, count=1)  # Remove ONLY from the first place (which is isLoading)

modalJsx = """
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
"""

c = re.sub(r'      <\/div>\s*\);\s*\}\s*const AnimatedCityBackground = \(\) => \{', modalJsx + '  const AnimatedCityBackground = () => {', c)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed rendering!")
