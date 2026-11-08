-- Procedimento do relatório gerencial.
-- No PostgreSQL, uma consulta que devolve linhas é uma função.
-- Junta Filme, Sala, Sessao, AssentoSessao e Ingresso.

CREATE OR REPLACE FUNCTION relatorio_vendas()
RETURNS TABLE (
    filme TEXT,
    sala TEXT,
    inicio TIMESTAMP(3),
    preco DECIMAL(10, 2),
    capacidade BIGINT,
    vendidos BIGINT,
    reservados BIGINT,
    livres BIGINT,
    ocupacao DECIMAL(10, 2),
    total_vendas DECIMAL(10, 2)
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        f.titulo,
        sa.nome,
        s.inicio,
        s.preco,
        COUNT(a.id),
        SUM(CASE WHEN a.status = 'VENDIDO' THEN 1 ELSE 0 END),
        SUM(CASE WHEN a.status = 'RESERVADO' THEN 1 ELSE 0 END),
        SUM(CASE WHEN a.status = 'LIVRE' THEN 1 ELSE 0 END),
        CASE
            WHEN COUNT(a.id) = 0 THEN 0::DECIMAL(10, 2)
            ELSE ROUND(
                (100.0 * SUM(CASE WHEN a.status = 'VENDIDO' THEN 1 ELSE 0 END)) / COUNT(a.id),
                2
            )::DECIMAL(10, 2)
        END,
        COALESCE(SUM(i.valor), 0)::DECIMAL(10, 2)
    FROM "Sessao" s
    JOIN "Filme" f ON f.id = s."filmeId"
    JOIN "Sala" sa ON sa.id = s."salaId"
    LEFT JOIN "AssentoSessao" a ON a."sessaoId" = s.id
    LEFT JOIN "Ingresso" i ON i."assentoSessaoId" = a.id
    GROUP BY s.id, f.titulo, sa.nome, s.inicio, s.preco
    ORDER BY s.inicio;
$$;

-- Impede que um assento já vendido volte a ficar livre ou reservado.

CREATE OR REPLACE FUNCTION impedir_alterar_assento_vendido()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status = 'VENDIDO' AND NEW.status <> 'VENDIDO' THEN
        RAISE EXCEPTION 'Assento já vendido não pode voltar a ficar livre ou reservado';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_impedir_alterar_assento_vendido
BEFORE UPDATE ON "AssentoSessao"
FOR EACH ROW
EXECUTE FUNCTION impedir_alterar_assento_vendido();
