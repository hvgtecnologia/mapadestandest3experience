-- ============================================================
-- VERIFICAR CONTAGEM E NUMERAÇÃO DOS STANDS NO BANCO
-- Execute no Supabase SQL Editor para diagnóstico
-- ============================================================

-- 1. Total de stands
SELECT COUNT(*) AS total_no_banco FROM stands;

-- 2. Listar todos os números existentes em ordem
SELECT numero FROM stands ORDER BY numero;

-- 3. Verificar números faltantes entre 1 e 114
SELECT generate_series AS numero_faltante
FROM generate_series(1, 114)
WHERE generate_series NOT IN (SELECT numero FROM stands);

-- 4. Verificar números duplicados
SELECT numero, COUNT(*) AS ocorrencias
FROM stands
GROUP BY numero
HAVING COUNT(*) > 1;

-- ============================================================
-- APÓS VER O DIAGNÓSTICO, SE PRECISAR RESETAR COMPLETO:
-- ============================================================

-- Limpar tudo e reinserir 1-114 do zero:
/*
DELETE FROM stands;

INSERT INTO stands (numero, status, tipo)
SELECT n, 'disponivel', 'prata'
FROM generate_series(1, 114) n;
*/
