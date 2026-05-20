-- =====================================================
-- RESET COMPLETO DOS STANDS T3 EXPERIENCE
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Remover stand espúrio (-1) se existir
DELETE FROM stands WHERE numero = -1;

-- 2. Atualizar todos os existentes para disponível e categoria prata
UPDATE stands SET status = 'disponivel', empresa = NULL, tipo = 'prata' WHERE numero >= 1;

-- 3. Inserir stands faltantes (101-114 = arquibancada)
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
ON CONFLICT (numero) DO UPDATE SET status = 'disponivel', empresa = NULL, tipo = 'prata';

-- 4. Verificar contagem total (deve retornar 114)
SELECT COUNT(*) as total_stands FROM stands WHERE numero >= 1;
