PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Cria a tabela de categorias
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Categoria_nome_key"
ON "Categoria"("nome");

-- Converte as categorias de texto existentes em registros
INSERT INTO "Categoria" (
    "nome",
    "descricao",
    "ativo",
    "criadoEm",
    "atualizadoEm"
)
SELECT DISTINCT
    COALESCE(
        NULLIF(TRIM("categoria"), ''),
        'Sem categoria'
    ),
    NULL,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Equipamento";

-- Recria Equipamento com categoriaId
CREATE TABLE "new_Equipamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "fabricante" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "patrimonio" TEXT,
    "status" TEXT NOT NULL,
    "observacoes" TEXT,
    "categoriaId" INTEGER NOT NULL,
    "setorId" INTEGER,
    "localizacaoId" INTEGER,
    "responsavelId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,

    CONSTRAINT "Equipamento_categoriaId_fkey"
        FOREIGN KEY ("categoriaId")
        REFERENCES "Categoria" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT "Equipamento_setorId_fkey"
        FOREIGN KEY ("setorId")
        REFERENCES "Setor" ("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT "Equipamento_localizacaoId_fkey"
        FOREIGN KEY ("localizacaoId")
        REFERENCES "Localizacao" ("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT "Equipamento_responsavelId_fkey"
        FOREIGN KEY ("responsavelId")
        REFERENCES "Colaborador" ("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Copia os equipamentos e encontra o ID de cada categoria
INSERT INTO "new_Equipamento" (
    "id",
    "nome",
    "fabricante",
    "modelo",
    "numeroSerie",
    "patrimonio",
    "status",
    "observacoes",
    "categoriaId",
    "setorId",
    "localizacaoId",
    "responsavelId",
    "criadoEm",
    "atualizadoEm"
)
SELECT
    equipamento."id",
    equipamento."nome",
    equipamento."fabricante",
    equipamento."modelo",
    equipamento."numeroSerie",
    equipamento."patrimonio",
    equipamento."status",
    equipamento."observacoes",
    categoria."id",
    equipamento."setorId",
    equipamento."localizacaoId",
    equipamento."responsavelId",
    equipamento."criadoEm",
    equipamento."atualizadoEm"
FROM "Equipamento" AS equipamento
INNER JOIN "Categoria" AS categoria
    ON categoria."nome" = COALESCE(
        NULLIF(TRIM(equipamento."categoria"), ''),
        'Sem categoria'
    );

DROP TABLE "Equipamento";

ALTER TABLE "new_Equipamento"
RENAME TO "Equipamento";

CREATE UNIQUE INDEX "Equipamento_numeroSerie_key"
ON "Equipamento"("numeroSerie");

CREATE UNIQUE INDEX "Equipamento_patrimonio_key"
ON "Equipamento"("patrimonio");

CREATE INDEX "Equipamento_categoriaId_idx"
ON "Equipamento"("categoriaId");

CREATE INDEX "Equipamento_setorId_idx"
ON "Equipamento"("setorId");

CREATE INDEX "Equipamento_localizacaoId_idx"
ON "Equipamento"("localizacaoId");

CREATE INDEX "Equipamento_responsavelId_idx"
ON "Equipamento"("responsavelId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;