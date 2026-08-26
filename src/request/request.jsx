import { supabase } from './supabaseClient';

export async function fetchPlayerData(playerId = 'A26-I99') {
  const { data, error } = await supabase
    .rpc('get_player_full_data', { p_player_id: playerId });

  if (error) {
    console.error('Erro ao buscar dados do jogador:', error.message);
    return null;
  }
    console.log('Dados crus recebidos do Supabase RPC:', data);

  return data;
}

export async function updateSetorStatus(setorId, newStatus) {
  const { error } = await supabase.rpc('update_setor_status', {
    p_setor_id: setorId,
    p_status: newStatus
  });

  if (error) {
    console.error(`Erro ao atualizar status do setor ${setorId}:`, error);
  }
}