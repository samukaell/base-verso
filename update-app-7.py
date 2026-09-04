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
      </div>
    );
  }
"""

c = c.replace('      </div>\n    );\n  }\n  const AnimatedCityBackground = () => {', modalJsx + '  const AnimatedCityBackground = () => {')

# Or fallback if endings are weird
c = re.sub(r'      <\/div>\s*\);\s*\}\s*const AnimatedCityBackground = \(\) => \{', modalJsx + '  const AnimatedCityBackground = () => {', c)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Done final fix")
