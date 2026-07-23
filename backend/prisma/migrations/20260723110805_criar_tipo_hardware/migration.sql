/*
  Warnings:

  - You are about to drop the column `tipo` on the `Hardware` table. All the data in the column will be lost.
  - Added the required column `tipoHardwareId` to the `Hardware` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "TipoHardware" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hardware" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "fabricante" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "observacoes" TEXT,
    "tipoHardwareId" INTEGER NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Hardware_tipoHardwareId_fkey" FOREIGN KEY ("tipoHardwareId") REFERENCES "TipoHardware" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hardware_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Hardware" ("atualizadoEm", "criadoEm", "equipamentoId", "fabricante", "id", "modelo", "nome", "numeroSerie", "observacoes") SELECT "atualizadoEm", "criadoEm", "equipamentoId", "fabricante", "id", "modelo", "nome", "numeroSerie", "observacoes" FROM "Hardware";
DROP TABLE "Hardware";
ALTER TABLE "new_Hardware" RENAME TO "Hardware";
CREATE INDEX "Hardware_tipoHardwareId_idx" ON "Hardware"("tipoHardwareId");
CREATE INDEX "Hardware_equipamentoId_idx" ON "Hardware"("equipamentoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TipoHardware_nome_key" ON "TipoHardware"("nome");
