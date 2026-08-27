import { supabase } from "./supabaseClient";

export async function fetchPlayerData(playerId = "A26-I99") {
  const { data, error } = await supabase.rpc("get_player_full_data", {
    p_player_id: playerId,
  });

  if (error) {
    console.error("Erro ao buscar dados do jogador:", error.message);
    return null;
  }
  console.log("Dados crus recebidos do Supabase RPC:", data);

  return data;
}

export async function updateSetorStatus(setorId, newStatus) {
  const { error } = await supabase.rpc("update_setor_status", {
    p_setor_id: setorId,
    p_status: newStatus,
  });

  if (error) {
    console.error(`Erro ao atualizar status do setor ${setorId}:`, error);
  }
}

export async function iniciarLinhaProducao(fabricaId, receitaId) {
  const { data, error } = await supabase
    .from("fabricas")
    .update({
      receita_id: receitaId,
      em_loop: true,
      status: "OPERANDO",
      data_hora_ultimo_ciclo: new Date().toISOString(),
    })
    .eq("id", fabricaId)
    .select();

  if (error) console.error("Erro ao iniciar produção:", error);
  return data;
}

export async function pausarLinhaProducao(fabricaId) {
  const { data, error } = await supabase
    .from("fabricas")
    .update({
      em_loop: false,
      status: "DESATIVADO",
    })
    .eq("id", fabricaId)
    .select();

  if (error) console.error("Erro ao pausar produção:", error);
  return data;
}

export async function executarTimeSkip(baseId, totalDias = 1) {
  const totalHoras = totalDias * 24;

  const { data, error } = await supabase.rpc("simular_producao_base", {
    p_base_id: baseId,
    p_horas_avanco: totalHoras,
  });

  if (error) {
    console.error("Erro ao executar time skip:", error);
    return null;
  }

  return data; // { sucesso: true, base_id: "...", ciclos_totais_processados: 48, horas_simuladas: 24 }
}

export async function pularTempoMundo(mundoId = "MUNDO-01", horas = 24) {
  try {
    const { data, error } = await supabase.rpc("avancar_tempo_mundo", {
      p_mundo_id: mundoId,
      p_horas_salto: horas,
    });

    if (error) {
      console.error("Erro ao avançar tempo do mundo:", error.message);
      return { success: false, error: error.message };
    }

    console.log("Resultado do Time Skip:", data);
    return data;
  } catch (err) {
    console.error("Erro inesperado:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchEstoquePorJogador(playerId = "A26-I99") {
  try {
    const { data, error } = await supabase.rpc("get_estoque_jogador", {
      p_jogador_id: playerId,
    });

    if (error) {
      console.error("Erro ao buscar estoque do jogador:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erro inesperado na chamada:", err);
    return null;
  }
}

export async function criarNovoSetor({
  baseId,
  nome,
  posicaoX = 0,
  posicaoY = 0,
  nivelDefesa = 1,
  provedorEnergiaId = null,
}) {
  try {
    const { data, error } = await supabase.rpc("criar_novo_setor", {
      p_base_id: baseId,
      p_nome: nome,
      p_posicao_x: posicaoX,
      p_posicao_y: posicaoY,
      p_nivel_defesa: nivelDefesa,
      p_provedor_energia_id: provedorEnergiaId,
    });

    if (error) {
      console.error("Erro na RPC criar_novo_setor:", error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error("Erro inesperado ao criar setor:", err);
    return { success: false, message: err.message };
  }
}

export async function listarEstruturasBase(baseId, tipoEstrutura = "TODOS") {
  /*TipoEstrutura;
    SETORES
    FABRICAS
    ARMAZENAMENTO
    ENERGIA
    TODOS
  */
  try {
    const { data, error } = await supabase.rpc("listar_estruturas_base", {
      p_base_id: baseId,
      p_tipo_estrutura: tipoEstrutura,
    });

    if (error) {
      console.error("Erro ao listar estruturas:", error.message);
      return { success: false, message: error.message, estruturas: [] };
    }

    return data;
  } catch (err) {
    console.error("Erro inesperado:", err);
    return { success: false, message: err.message, estruturas: [] };
  }
}

export async function adicionarInstalacoesSetor({
  setorId,
  fabrica = null,
  armazenamento = null,
  energia = null,
}) {
  try {
    const { data, error } = await supabase.rpc('adicionar_instalacao_setor', {
      p_setor_id: setorId,
      p_fabrica: fabrica,
      p_armazenamento: armazenamento,
      p_energia: energia,
    });

    if (error) {
      console.error('Erro na RPC adicionar_instalacao_setor:', error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message };
  }
}

export async function criarEstrada({
  origemSetorId,
  destinoSetorId,
  nome = null,
  capacidadeFluxo = 500.0,
}) {
  try {
    const { data, error } = await supabase.rpc('criar_estrada_entre_setores', {
      p_origem_setor_id: origemSetorId,
      p_destino_setor_id: destinoSetorId,
      p_nome: nome,
      p_capacidade_fluxo_ton_dia: capacidadeFluxo,
    });

    if (error) {
      console.error('Erro ao criar estrada:', error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado na chamada:', err);
    return { success: false, message: err.message };
  }
}

export async function transferirEstoque({
  armazemOrigemId,
  armazemDestinoId,
  materialId,
  quantidadeTon,
}) {
  try {
    const { data, error } = await supabase.rpc('transferir_estoque_armazens', {
      p_armazem_origem_id: armazemOrigemId,
      p_armazem_destino_id: armazemDestinoId,
      p_material_id: materialId,
      p_quantidade_ton: quantidadeTon,
    });

    if (error) {
      console.error('Erro na RPC transferir_estoque_armazens:', error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message };
  }
}

export async function reativarProcesso(processoId, forcarLoop = true) {
  try {
    const { data, error } = await supabase.rpc('reativar_processo_producao', {
      p_processo_id: processoId,
      p_forcar_loop: forcarLoop,
    });

    if (error) {
      console.error('Erro ao reativar processo:', error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message };
  }
}
