CREATE OR REPLACE FUNCTION public.criar_nova_ficha(
    p_base_id VARCHAR,
    p_nome VARCHAR,
    p_posicao_x NUMERIC,
    p_posicao_y NUMERIC,
    p_jogador_id VARCHAR DEFAULT NULL,
    p_descricao TEXT DEFAULT '',
    p_forca NUMERIC DEFAULT 0,
    p_habilidade NUMERIC DEFAULT 0,
    p_resistencia NUMERIC DEFAULT 0,
    p_armadura NUMERIC DEFAULT 0,
    p_poder NUMERIC DEFAULT 0,
    p_vantagens TEXT[] DEFAULT '{}',
    p_desvantagens TEXT[] DEFAULT '{}',
    p_skills TEXT[] DEFAULT '{}',
    p_energia_requerida_kwh NUMERIC DEFAULT 0.0,
    p_status VARCHAR DEFAULT 'ATIVO'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_nova_ficha_id VARCHAR;
    v_resultado JSONB;
BEGIN
    -- Validação básica
    IF p_base_id IS NULL OR p_nome IS NULL THEN
        RAISE EXCEPTION 'Base ID e Nome são obrigatórios.';
    END IF;

    -- Gera um ID único para a ficha (ex: FICHA_XXXXXX)
    v_nova_ficha_id := 'FICHA_' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

    -- Insere a ficha na tabela principal (assumindo que seja 'fichas')
    -- NOTA: Ajuste o nome da tabela e das colunas conforme o seu schema real no Supabase
    INSERT INTO public.fichas (
        id, 
        base_id, 
        nome, 
        posicao_x, 
        posicao_y, 
        jogador_id, 
        descricao, 
        forca, 
        habilidade, 
        resistencia, 
        armadura, 
        poder, 
        vantagens, 
        desvantagens, 
        skills, 
        energia_requerida_kwh, 
        status,
        criado_em,
        atualizado_em
    ) VALUES (
        v_nova_ficha_id,
        p_base_id,
        p_nome,
        p_posicao_x,
        p_posicao_y,
        p_jogador_id,
        p_descricao,
        p_forca,
        p_habilidade,
        p_resistencia,
        p_armadura,
        p_poder,
        p_vantagens,
        p_desvantagens,
        p_skills,
        p_energia_requerida_kwh,
        p_status,
        NOW(),
        NOW()
    );

    -- Monta o objeto de retorno
    v_resultado := jsonb_build_object(
        'success', true,
        'ficha_id', v_nova_ficha_id,
        'message', 'Ficha criada com sucesso'
    );

    RETURN v_resultado;

EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro, retorna a mensagem de erro
    RETURN jsonb_build_object(
        'success', false,
        'message', SQLERRM
    );
END;
$$;
