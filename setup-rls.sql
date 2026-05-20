-- =====================================================
-- PASSO 1: CONFIGURAR RLS (permissões de acesso)
-- Execute este bloco PRIMEIRO no Supabase SQL Editor
-- =====================================================

-- Garantir que RLS está ativado
ALTER TABLE stands ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT para todos (leitura pública)
DROP POLICY IF EXISTS "allow_select" ON stands;
CREATE POLICY "allow_select"
  ON stands FOR SELECT
  USING (true);

-- Permitir UPDATE para todos (necessário para salvar reservas e edições admin)
DROP POLICY IF EXISTS "allow_update" ON stands;
CREATE POLICY "allow_update"
  ON stands FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Permitir INSERT para todos (necessário para criar stands via API)
DROP POLICY IF EXISTS "allow_insert" ON stands;
CREATE POLICY "allow_insert"
  ON stands FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- PASSO 2: RESET DE STANDS
-- Coloca todos de 1 a 100 como disponível e prata
-- =====================================================

UPDATE stands
SET status = 'disponivel', empresa = NULL, tipo = 'prata'
WHERE numero BETWEEN 1 AND 100;

-- =====================================================
-- PASSO 3: INSERIR ARQUIBANCADA (101-114)
-- =====================================================

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

-- =====================================================
-- PASSO 4: VERIFICAR
-- =====================================================

SELECT COUNT(*) AS total, status FROM stands
WHERE numero BETWEEN 1 AND 114
GROUP BY status;
