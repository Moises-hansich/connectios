/*
  Warnings:

  - You are about to drop the column `setor` on the `Colaborador` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Colaborador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cargo" TEXT,
    "localizacaoId" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Colaborador_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Colaborador" ("ativo", "atualizadoEm", "cargo", "criadoEm", "email", "id", "nome", "telefone") SELECT "ativo", "atualizadoEm", "cargo", "criadoEm", "email", "id", "nome", "telefone" FROM "Colaborador";
DROP TABLE "Colaborador";
ALTER TABLE "new_Colaborador" RENAME TO "Colaborador";
CREATE UNIQUE INDEX "Colaborador_email_key" ON "Colaborador"("email");
CREATE INDEX "Colaborador_localizacaoId_idx" ON "Colaborador"("localizacaoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
