-- ============================================================
-- RESET COMPLETO — NOVO MAPA 97 STANDS (mapa_evento v10)
--
-- CATEGORIAS:
--   prata  = stands 01-30  (cols 1-2)
--   outro  = stands 31-60 + 91-97  (cols 3-4 + tira topo)
--   bronze = stands 61-90  (cols 5-6)
--
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Remover stands que não existem no novo layout (>97 exceto lista)
DELETE FROM stands WHERE numero > 97;

-- 2. Inserir/atualizar todos os stands com tipo correto
INSERT INTO stands (numero, status, tipo) VALUES
-- PRATA: cols 1-2 (01-30)
  (1,'disponivel','prata'),(2,'disponivel','prata'),(3,'disponivel','prata'),
  (4,'disponivel','prata'),(5,'disponivel','prata'),(6,'disponivel','prata'),
  (7,'disponivel','prata'),(8,'disponivel','prata'),(9,'disponivel','prata'),
  (10,'disponivel','prata'),(11,'disponivel','prata'),(12,'disponivel','prata'),
  (13,'disponivel','prata'),(14,'disponivel','prata'),(15,'disponivel','prata'),
  (16,'disponivel','prata'),(17,'disponivel','prata'),(18,'disponivel','prata'),
  (19,'disponivel','prata'),(20,'disponivel','prata'),(21,'disponivel','prata'),
  (22,'disponivel','prata'),(23,'disponivel','prata'),(24,'disponivel','prata'),
  (25,'disponivel','prata'),(26,'disponivel','prata'),(27,'disponivel','prata'),
  (28,'disponivel','prata'),(29,'disponivel','prata'),(30,'disponivel','prata'),
-- OUTRO: cols 3-4 (31-60)
  (31,'disponivel','outro'),(32,'disponivel','outro'),(33,'disponivel','outro'),
  (34,'disponivel','outro'),(35,'disponivel','outro'),(36,'disponivel','outro'),
  (37,'disponivel','outro'),(38,'disponivel','outro'),(39,'disponivel','outro'),
  (40,'disponivel','outro'),(41,'disponivel','outro'),(42,'disponivel','outro'),
  (43,'disponivel','outro'),(44,'disponivel','outro'),(45,'disponivel','outro'),
  (46,'disponivel','outro'),(47,'disponivel','outro'),(48,'disponivel','outro'),
  (49,'disponivel','outro'),(50,'disponivel','outro'),(51,'disponivel','outro'),
  (52,'disponivel','outro'),(53,'disponivel','outro'),(54,'disponivel','outro'),
  (55,'disponivel','outro'),(56,'disponivel','outro'),(57,'disponivel','outro'),
  (58,'disponivel','outro'),(59,'disponivel','outro'),(60,'disponivel','outro'),
-- BRONZE: cols 5-6 (61-90)
  (61,'disponivel','bronze'),(62,'disponivel','bronze'),(63,'disponivel','bronze'),
  (64,'disponivel','bronze'),(65,'disponivel','bronze'),(66,'disponivel','bronze'),
  (67,'disponivel','bronze'),(68,'disponivel','bronze'),(69,'disponivel','bronze'),
  (70,'disponivel','bronze'),(71,'disponivel','bronze'),(72,'disponivel','bronze'),
  (73,'disponivel','bronze'),(74,'disponivel','bronze'),(75,'disponivel','bronze'),
  (76,'disponivel','bronze'),(77,'disponivel','bronze'),(78,'disponivel','bronze'),
  (79,'disponivel','bronze'),(80,'disponivel','bronze'),(81,'disponivel','bronze'),
  (82,'disponivel','bronze'),(83,'disponivel','bronze'),(84,'disponivel','bronze'),
  (85,'disponivel','bronze'),(86,'disponivel','bronze'),(87,'disponivel','bronze'),
  (88,'disponivel','bronze'),(89,'disponivel','bronze'),(90,'disponivel','bronze'),
-- OUTRO: tira topo (91-97)
  (91,'disponivel','outro'),(92,'disponivel','outro'),(93,'disponivel','outro'),
  (94,'disponivel','outro'),(95,'disponivel','outro'),(96,'disponivel','outro'),
  (97,'disponivel','outro')
ON CONFLICT (numero) DO UPDATE
  SET tipo = EXCLUDED.tipo,
      status = 'disponivel',
      empresa = NULL;

-- 3. Verificar: deve retornar 97
SELECT COUNT(*) AS total, tipo FROM stands GROUP BY tipo ORDER BY tipo;
