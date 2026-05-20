-- =====================================================
-- RESET COMPLETO DOS STANDS T3 EXPERIENCE
-- Total: 111 stands (sem 14, sem 59, sem 60)
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Remover stands fora do layout (14, 59, 60, -1 e qualquer outro inválido)
DELETE FROM stands WHERE numero IN (-1, 14, 59, 60);

-- 2. Atualizar todos os existentes para disponível e categoria prata
UPDATE stands
SET status = 'disponivel', empresa = NULL, tipo = 'prata'
WHERE numero >= 1;

-- 3. Inserir stands faltantes da coluna direita (arquibancada 101-114)
INSERT INTO stands (numero, status, tipo) VALUES
  (101, 'disponivel', 'prata'),
  (102, 'disponivel', 'prata'),
  (103, 'disponivel', 'prata'),
  (104, 'disponivel', 'prata'),
  (105, 'disponivel', 'prata'),
  (106, 'disponivel', 'prata'),
  (107, 'disponivel', 'prata'),
  (108, 'disponivel', 'prata'),
  (109, 'disponivel', 'prata'),
  (110, 'disponivel', 'prata'),
  (111, 'disponivel', 'prata'),
  (112, 'disponivel', 'prata'),
  (113, 'disponivel', 'prata'),
  (114, 'disponivel', 'prata')
ON CONFLICT (numero) DO UPDATE
  SET status = 'disponivel', empresa = NULL, tipo = 'prata';

-- 4. Verificar contagem total (deve retornar 111)
SELECT COUNT(*) AS total_stands
FROM stands
WHERE numero >= 1
  AND numero NOT IN (14, 59, 60);
