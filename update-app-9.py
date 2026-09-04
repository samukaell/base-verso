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

target = "      </div>\n    );\n  }\n  const AnimatedCityBackground = () => {"
if target in c:
    c = c.replace(target, modalJsx + target)
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed!")
else:
    target2 = "      </div>\n    );\n  }\nconst AnimatedCityBackground = () => {"
    if target2 in c:
        c = c.replace(target2, modalJsx + target2)
        with open('src/App.jsx', 'w', encoding='utf-8') as f:
            f.write(c)
        print("Fixed! target2")
    else:
        print("COULD NOT FIND TARGET")
