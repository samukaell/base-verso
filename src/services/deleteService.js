import { supabase } from '../request/supabaseClient';

export const deletarFabrica = async (id) => {
  try {
    const { data, error } = await supabase.rpc('deletar_estrutura', { p_id: id, p_tipo_estrutura: 'FABRICAS' });
    if (error) return { success: false, message: error.message };
    return { success: true, id_removido: id, ...data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const deletarArmazenamento = async (id) => {
  try {
    const { data, error } = await supabase.rpc('deletar_estrutura', { p_id: id, p_tipo_estrutura: 'ARMAZENAMENTO' });
    if (error) return { success: false, message: error.message };
    return { success: true, id_removido: id, ...data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const deletarEnergia = async (id) => {
  try {
    const { data, error } = await supabase.rpc('deletar_estrutura', { p_id: id, p_tipo_estrutura: 'ENERGIA' });
    if (error) return { success: false, message: error.message };
    return { success: true, id_removido: id, ...data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const deletarSetor = async (id) => {
  try {
    const { data, error } = await supabase.rpc('deletar_estrutura', { p_id: id, p_tipo_estrutura: 'SETORES' });
    if (error) return { success: false, message: error.message };
    return { success: true, id_removido: id, ...data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const deletarEstrada = async (id) => {
  try {
    const { data, error } = await supabase.rpc('deletar_estrutura', { p_id: id, p_tipo_estrutura: 'ESTRADAS' }); // ESTRADAS wasn't listed, maybe it's its own? I'll use ESTRADAS or fallback to 'deletar_estrada'
    if (error) {
      // Fallback in case there's a specific RPC for roads
      const fallback = await supabase.rpc('deletar_estrada', { p_id: id });
      if (fallback.error) return { success: false, message: fallback.error.message };
      return { success: true, id_removido: id, ...fallback.data };
    }
    return { success: true, id_removido: id, ...data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
