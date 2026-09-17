ALTER TABLE "Categoria"
ADD COLUMN "grupo" TEXT NOT NULL DEFAULT 'OUTROS'
CHECK ("grupo" IN ('COMPUTADORES', 'PERIFERICOS', 'PECAS', 'OUTROS'));

-- Normaliza os nomes existentes para fazer a classificação inicial.
-- Depois desta migração, a classificação dependerá do grupo cadastrado,
-- não do nome da categoria.

WITH RECURSIVE nomes_normalizados(id, nome) AS (
  SELECT
    id,
    lower(
      trim(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(
                      replace(
                        replace(
                          replace(
                            replace(
                              replace(nome, 'Ó', 'o'),
                              'ó', 'o'
                            ),
                            'Ã', 'a'
                          ),
                          'ã', 'a'
                        ),
                        'Á', 'a'
                      ),
                      'á', 'a'
                    ),
                    'É', 'e'
                  ),
                  'é', 'e'
                ),
                '-', ' '
              ),
              '_', ' '
            ),
            char(9), ' '
          ),
          char(10), ' '
        )
      )
    )
  FROM "Categoria"

  UNION ALL

  SELECT
    id,
    replace(nome, '  ', ' ')
  FROM nomes_normalizados
  WHERE instr(nome, '  ') > 0
)

UPDATE "Categoria"
SET "grupo" = CASE
  WHEN (
    SELECT nome
    FROM nomes_normalizados
    WHERE id = "Categoria".id
      AND instr(nome, '  ') = 0
  ) IN (
    'computador',
    'computadores',
    'desktop',
    'desktops',
    'notebook',
    'notebooks',
    'servidor',
    'servidores',
    'all in one'
  )
  THEN 'COMPUTADORES'

  WHEN (
    SELECT nome
    FROM nomes_normalizados
    WHERE id = "Categoria".id
      AND instr(nome, '  ') = 0
  ) IN (
    'monitor',
    'monitores',
    'teclado',
    'teclados',
    'mouse',
    'mouses',
    'impressora',
    'impressoras',
    'scanner',
    'scanners',
    'webcam',
    'webcams',
    'headset',
    'headsets',
    'tv',
    'televisao',
    'televisores',
    'projetor',
    'projetores'
  )
  THEN 'PERIFERICOS'

  WHEN (
    SELECT nome
    FROM nomes_normalizados
    WHERE id = "Categoria".id
      AND instr(nome, '  ') = 0
  ) IN (
    'memoria',
    'memorias',
    'memoria ram',
    'memorias ram',
    'ram',
    'ssd',
    'ssds',
    'hd',
    'hds',
    'hdd',
    'hdds',
    'processador',
    'processadores',
    'placa de video',
    'placas de video',
    'placa mae',
    'placas mae',
    'fonte',
    'fontes',
    'cooler',
    'coolers',
    'armazenamento'
  )
  THEN 'PECAS'

  ELSE 'OUTROS'
END;