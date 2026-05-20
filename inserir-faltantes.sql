-- ============================================================
-- INSERIR STANDS FALTANTES SEM APAGAR OS EXISTENTES
-- Insere APENAS os que não existem no banco (seguro para reservas já feitas)
-- Execute no Supabase SQL Editor
-- ============================================================

INSERT INTO stands (numero, status, tipo)
SELECT n, 'disponivel', 'prata'
FROM generate_series(1, 114) n
WHERE n NOT IN (SELECT numero FROM stands);

-- Verificar resultado — deve retornar 114
SELECT COUNT(*) AS total FROM stands;

-- Ver quais ainda estão faltando (deve retornar vazio)
SELECT generate_series AS faltando
FROM generate_series(1, 114)
WHERE generate_series NOT IN (SELECT numero FROM stands);
