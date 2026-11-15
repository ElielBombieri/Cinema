-- Verifica dados existentes antes de criar a restrição.
-- A migration interrompe com uma mensagem clara se houver duplicidades;
-- nenhuma sessão ou venda existente é removida automaticamente.
DO $$
DECLARE
    duplicidades TEXT;
BEGIN
    SELECT string_agg(
        format('sala %s, início %s (%s sessões)', "salaId", inicio, quantidade),
        '; ' ORDER BY "salaId", inicio
    )
    INTO duplicidades
    FROM (
        SELECT "salaId", inicio, COUNT(*) AS quantidade
        FROM "Sessao"
        GROUP BY "salaId", inicio
        HAVING COUNT(*) > 1
    ) AS sessoes_duplicadas;

    IF duplicidades IS NOT NULL THEN
        RAISE EXCEPTION 'Existem sessões duplicadas: %', duplicidades
            USING HINT = 'Resolva as duplicidades listadas e aplique novamente esta migration.';
    END IF;
END $$;

CREATE UNIQUE INDEX "Sessao_salaId_inicio_key"
ON "Sessao"("salaId", inicio);
