const fs = require('fs');
const content = `
/**
 * Cria uma nova ficha alocada no grid da base.
 * @param {Object} params
 */
export async function criarNovaFicha({
  baseId,
  nome,
  posicaoX,
  posicaoY,
  jogadorId = null,
  descricao = '',
  forca = 0,
  habilidade = 0,
  resistencia = 0,
  armadura = 0,
  poder = 0,
  vantagens = [],
  desvantagens = [],
  skills = [],
  energiaRequeridaKwh = 0.0,
  status = 'ATIVO',
}) {
  try {
    const { data, error } = await supabase.rpc('criar_nova_ficha', {
      p_base_id: baseId,
      p_nome: nome,
      p_posicao_x: Number(posicaoX),
      p_posicao_y: Number(posicaoY),
      p_jogador_id: jogadorId,
      p_descricao: descricao,
      p_forca: Number(forca),
      p_habilidade: Number(habilidade),
      p_resistencia: Number(resistencia),
      p_armadura: Number(armadura),
      p_poder: Number(poder),
      p_vantagens: vantagens,
      p_desvantagens: desvantagens,
      p_skills: skills,
      p_energia_requerida_kwh: Number(energiaRequeridaKwh),
      p_status: status,
    });

    if (error) {
      console.error('Erro na RPC criar_nova_ficha:', error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message };
  }
}
`;
fs.appendFileSync('src/request/request.jsx', '\n' + content);
console.log('Added criarNovaFicha to request.jsx');
