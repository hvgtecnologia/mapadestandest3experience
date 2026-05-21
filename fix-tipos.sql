-- ============================================================
-- PASSO 1: Liberar o campo tipo para aceitar qualquer texto
-- (remove restrições de enum/check se existirem)
-- ============================================================
ALTER TABLE stands ALTER COLUMN tipo TYPE text;

-- ============================================================
-- PASSO 2: Atualizar os tipos conforme o mapa do evento
--   prata  = stands 01-30  (cols 1-2)
--   outro  = stands 31-60 + 91-97  (cols 3-4 + tira topo)
--   bronze = stands 61-90  (cols 5-6)
-- ============================================================
UPDATE stands SET tipo = 'prata'  WHERE numero BETWEEN 1  AND 30;
UPDATE stands SET tipo = 'outro'  WHERE numero BETWEEN 31 AND 60;
UPDATE stands SET tipo = 'bronze' WHERE numero BETWEEN 61 AND 90;
UPDATE stands SET tipo = 'outro'  WHERE numero BETWEEN 91 AND 97;

-- ============================================================
-- PASSO 3: Verificar resultado (deve mostrar 3 categorias)
-- ============================================================
SELECT tipo, COUNT(*) AS quantidade
FROM stands
GROUP BY tipo
ORDER BY tipo;
