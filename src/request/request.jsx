import { supabase } from "./supabaseClient";

export async function fetchPlayerData(playerId = "A26-I99") {
  const { data, error } = await supabase.rpc("obter_dados_completos_jogador", {
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

  if (error) console.error("Erro ao iniciar produÃ§Ã£o:", error);
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

  if (error) console.error("Erro ao pausar produÃ§Ã£o:", error);
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
      console.error("Erro ao avanÃ§ar tempo do mundo:", error.message);
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
    // 1. Normaliza o payload da fÃ¡brica para o formato exato esperado pela procedure
    let payloadFabrica = null;
    if (fabrica) {
      payloadFabrica = {
        nome: fabrica.nome || fabrica.nome_fabrica || 'Nova FÃ¡brica',
        // Garante 'BASE' ou 'TECNOLOGIA' (o banco rejeita MANUFATURA)
        tipo: (fabrica.tipo || fabrica.tipo_fabrica || 'BASE').toUpperCase(),
        is_extracao: Boolean(fabrica.is_extracao),
        velocidade: Number(fabrica.velocidade || fabrica.velocidade_processamento || 1.0),
        energia_requerida: Number(fabrica.energia_requerida || fabrica.energia_requerida_kwh || 500.0),
      };
    }

    // 2. Chamada da RPC no Supabase
    const { data, error } = await supabase.rpc('adicionar_instalacao_setor', {
      p_setor_id: setorId,
      p_fabrica: payloadFabrica,
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

/**
 * Define ou altera o setor provedor de energia de um setor.
 * @param {string} setorClienteId - ID do setor que receberÃ¡ a energia (ex: 'SAM_SET_02')
 * @param {string|null} [setorProvedorId=null] - ID do setor com usina geradora, ou null para desconectar
 */
export async function definirProvedorEnergia(setorClienteId, setorProvedorId = null) {
  try {
    const { data, error } = await supabase.rpc('vincular_provedor_energia_setor', {
      p_setor_cliente_id: setorClienteId,
      p_setor_provedor_id: setorProvedorId,
    });

    if (error) {
      console.error('Erro na RPC vincular_provedor_energia_setor:', error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado ao vincular energia:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Cadastra um novo material validando nome Ãºnico e categoria.
 * 
 * @param {Object} params
 * @param {string} params.nome - Nome do material (ex: 'Liga de Cobalto')
 * @param {'MINERIO_BRUTO' | 'REFINADO' | 'COMPONENTE' | 'ENERGIA' | 'TECNOLOGIA_3DET'} params.categoria - Categoria do material
 * @param {1 | 2 | 3} params.nivelTier - Tier do material (1, 2 ou 3)
 * @param {string} [params.descricao] - DescriÃ§Ã£o do material (opcional)
 * @param {string} [params.idCustomizado] - ID customizado ex: 'MAT_COBALTO' (opcional)
 */
export async function criarNovoMaterial({
  nome,
  categoria,
  nivelTier,
  descricao = null,
  idCustomizado = null,
}) {
  try {
    const { data, error } = await supabase.rpc('criar_novo_material', {
      p_nome_material: nome,
      p_categoria: categoria,
      p_nivel_tier: nivelTier,
      p_descricao: descricao,
      p_id_customizado: idCustomizado,
    });

    if (error) {
      console.error('Erro na RPC criar_novo_material:', error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Retorna todos os materiais armazenados em uma base com seus tipos e quantidades.
 * @param {string} baseId - ID da base (ex: 'BASE_01')
 */
export async function listarMateriaisBase(baseId) {
  try {
    const { data, error } = await supabase.rpc('listar_materiais_base', {
      p_base_id: baseId,
    });

    if (error) {
      console.error('Erro ao listar materiais da base:', error.message);
      return { success: false, message: error.message, materiais: [] };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message, materiais: [] };
  }
}
export async function cadastrarReceita({
  nomeReceita,
  materialSaidaId,
  quantidadeSaida,
  ingredientes, // Array: [{ material_id: 'MAT_A', quantidade: 2.0 }]
  tempoCiclo = 1.0,
  energiaKwh = 500.0,
}) {
  try {
    const { data, error } = await supabase.rpc('criar_receita_producao', {
      p_nome_receita: nomeReceita,
      p_material_saida_id: materialSaidaId,
      p_quantidade_saida: quantidadeSaida,
      p_ingredientes: ingredientes,
      p_tempo_ciclo_horas: tempoCiclo,
      p_energia_requerida_kwh: energiaKwh,
    });

    return { data, error };
  } catch (err) {
    console.error('Erro inesperado ao cadastrar receita:', err);
    return { error: err };
  }
}

/**
 * Retorna todos os materiais cadastrados no catÃ¡logo global do jogo.
 */
export async function listarTodosMateriais() {
  try {
    const { data, error } = await supabase.rpc('listar_todos_materiais');

    if (error) {
      console.error('Erro na RPC listar_todos_materiais:', error.message);
      return { success: false, message: error.message, materiais: [] };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado ao listar materiais:', err);
    return { success: false, message: err.message, materiais: [] };
  }
}

/**
 * Busca todas as receitas do sistema com detalhes de tempo, energia e materiais.
 */
export async function listarTodasReceitas() {
  try {
    const { data, error } = await supabase.rpc('listar_todas_receitas');

    if (error) {
      console.error('Erro na RPC listar_todas_receitas:', error.message);
      return { success: false, message: error.message, receitas: [] };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado ao listar receitas:', err);
    return { success: false, message: err.message, receitas: [] };
  }
}

/**
 * Retorna todos os processos em andamento em um determinado setor.
 * @param {string} setorId - ID do setor (ex: 'SAM_SET_02')
 */
export async function listarProcessosAtivosSetor(setorId) {
  try {
    const { data, error } = await supabase.rpc('listar_processos_ativos_setor', {
      p_setor_id: setorId,
    });

    if (error) {
      console.error('Erro ao buscar processos do setor:', error.message);
      return { success: false, message: error.message, processos: [] };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message, processos: [] };
  }
}

/**
 * Retorna os detalhes de um mundo especÃ­fico.
 * @param {string} mundoId - ID do mundo (ex: 'MUNDO-01')
 */
export async function obterDetalhesMundo(mundoId) {
  try {
    const { data, error } = await supabase.rpc('obter_detalhes_mundo', {
      p_mundo_id: mundoId,
    });

    if (error) {
      console.error('Erro na RPC obter_detalhes_mundo:', error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Retorna a lista de todos os mundos disponÃ­veis.
 */
export async function listarTodosMundos() {
  try {
    const { data, error } = await supabase.rpc('listar_todos_mundos');

    if (error) {
      console.error('Erro na RPC listar_todos_mundos:', error.message);
      return { success: false, message: error.message, mundos: [] };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message, mundos: [] };
  }
}

/**
 * Interrompe ou pausa um processo de produÃ§Ã£o.
 * 
 * @param {string} processoId - ID do processo (ex: 'SAM_PROC_01')
 * @param {'PAUSADO' | 'INTERROMPIDO' | 'INTERROMPIDO_SEM_INSUMO' | 'INTERROMPIDO_ARMAZEM_CHEIO'} [novoStatus='PAUSADO']
 */
export async function interromperProcesso(processoId, novoStatus = 'PAUSADO') {
  try {
    const { data, error } = await supabase.rpc('interromper_processo_producao', {
      p_processo_id: processoId,
      p_novo_status: novoStatus,
    });

    if (error) {
      console.error('Erro ao interromper processo:', error.message);
      return { success: false, message: error.message };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Retorna todos os processos de uma base.
 * @param {string} baseId - ID da base
 */
export async function listarTodosProcessosBase(baseId) {
  try {
    const { data, error } = await supabase.rpc('listar_todos_processos_base', {
      p_base_id: baseId,
    });

    if (error) {
      console.error('Erro ao buscar processos da base:', error.message);
      return { success: false, message: error.message, processos: [] };
    }

    return data;
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { success: false, message: err.message, processos: [] };
  }
}





export async function atualizarStatusFicha(fichaId, novoStatus) { const { data, error } = await supabase.rpc('atualizar_status_ficha', { p_ficha_id: fichaId, p_novo_status: novoStatus }); if (error) console.error(error); return data; }
