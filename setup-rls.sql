-- =====================================================
-- CONFIGURAR RLS — permitir UPDATE na tabela stands
-- Execute este SQL no Supabase SQL Editor
-- ANTES de rodar este script, rode o reset-stands.sql
-- =====================================================

-- 1. Garantir que RLS está ativado
ALTER TABLE stands ENABLE ROW LEVEL SECURITY;

-- 2. Permitir SELECT para todos (leitura pública)
DROP POLICY IF EXISTS "allow_select" ON stands;
CREATE POLICY "allow_select"
  ON stands FOR SELECT
  USING (true);

-- 3. Permitir UPDATE para todos (necessário para salvar reservas e edições admin)
DROP POLICY IF EXISTS "allow_update" ON stands;
CREATE POLICY "allow_update"
  ON stands FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. Permitir INSERT para todos (necessário para criar stands via API)
DROP POLICY IF EXISTS "allow_insert" ON stands;
CREATE POLICY "allow_insert"
  ON stands FOR INSERT
  WITH CHECK (true);

-- 5. Confirmar as policies criadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'stands';
