import re

# 1. Update request.jsx
with open('src/request/request.jsx', 'r', encoding='utf-8') as f:
    req_c = f.read()

if "listarFichasBase" not in req_c:
    req_c += """
export async function listarFichasBase(baseId) {
  try {
    const { data, error } = await supabase.from('fichas').select('*').eq('base_id', baseId);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao listar fichas:', err.message);
    return [];
  }
}
"""
    with open('src/request/request.jsx', 'w', encoding='utf-8') as f:
        f.write(req_c)


# 2. Update App.jsx
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app_c = f.read()

# Add import for listarFichasBase
if "listarFichasBase" not in app_c:
    app_c = app_c.replace(
        "import { fetchPlayerData, updateSetorStatus, listarTodosProcessosBase, atualizarStatusFicha } from './request/request';",
        "import { fetchPlayerData, updateSetorStatus, listarTodosProcessosBase, atualizarStatusFicha, listarFichasBase } from './request/request';"
    )

# Replace the fichas loading logic
old_logic = """          const setores = baseToLoad.setores || [];
          const estradas = baseToLoad.estradas || [];"""

new_logic = """          const setores = baseToLoad.setores || [];
          const estradas = baseToLoad.estradas || [];
          
          let fichasData = [];
          try {
             fichasData = await listarFichasBase(baseToLoad.id);
          } catch(e) { console.error(e); }
          
          const formattedFichas = fichasData.map(f => ({
             ...f,
             posicao: { x: f.posicao_x, y: f.posicao_y }
          }));"""

if "listarFichasBase(baseToLoad.id)" not in app_c:
    app_c = app_c.replace(old_logic, new_logic)

old_combined = """          // Combine sectors and fichas for node rendering
          const combinedNodesData = [
            ...setores.map(s => ({ ...s, _nodeType: 'sector' })),
            ...(baseToLoad.fichas || []).map(f => ({ ...f, _nodeType: 'ficha' }))
          ];"""

new_combined = """          // Combine sectors and fichas for node rendering
          const combinedNodesData = [
            ...setores.map(s => ({ ...s, _nodeType: 'sector' })),
            ...formattedFichas.map(f => ({ ...f, _nodeType: 'ficha' }))
          ];"""

app_c = app_c.replace(old_combined, new_combined)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_c)

print("Patch applied to load fichas!")
