-- CreateTable
CREATE TABLE "Colaborador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cargo" TEXT,
    "setor" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fabricante" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "patrimonio" TEXT,
    "status" TEXT NOT NULL,
    "observacoes" TEXT,
    "localizacaoId" INTEGER,
    "responsavelId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Equipamento_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipamento" ("atualizadoEm", "categoria", "criadoEm", "fabricante", "id", "localizacaoId", "modelo", "nome", "numeroSerie", "observacoes", "patrimonio", "status") SELECT "atualizadoEm", "categoria", "criadoEm", "fabricante", "id", "localizacaoId", "modelo", "nome", "numeroSerie", "observacoes", "patrimonio", "status" FROM "Equipamento";
DROP TABLE "Equipamento";
ALTER TABLE "new_Equipamento" RENAME TO "Equipamento";
CREATE UNIQUE INDEX "Equipamento_numeroSerie_key" ON "Equipamento"("numeroSerie");
CREATE UNIQUE INDEX "Equipamento_patrimonio_key" ON "Equipamento"("patrimonio");
CREATE INDEX "Equipamento_localizacaoId_idx" ON "Equipamento"("localizacaoId");
CREATE INDEX "Equipamento_responsavelId_idx" ON "Equipamento"("responsavelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Colaborador_email_key" ON "Colaborador"("email");
