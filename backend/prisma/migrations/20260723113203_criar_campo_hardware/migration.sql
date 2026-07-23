/*
  Warnings:

  - You are about to drop the `HardwareAtributo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "HardwareAtributo_hardwareId_nome_key";

-- DropIndex
DROP INDEX "HardwareAtributo_hardwareId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HardwareAtributo";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CampoHardware" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "tipoDado" TEXT NOT NULL DEFAULT 'texto',
    "unidade" TEXT,
    "placeholder" TEXT,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "tipoHardwareId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "CampoHardware_tipoHardwareId_fkey" FOREIGN KEY ("tipoHardwareId") REFERENCES "TipoHardware" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HardwareValor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valor" TEXT NOT NULL,
    "hardwareId" INTEGER NOT NULL,
    "campoHardwareId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "HardwareValor_hardwareId_fkey" FOREIGN KEY ("hardwareId") REFERENCES "Hardware" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HardwareValor_campoHardwareId_fkey" FOREIGN KEY ("campoHardwareId") REFERENCES "CampoHardware" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TipoHardware" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);
INSERT INTO "new_TipoHardware" ("atualizadoEm", "criadoEm", "id", "nome") SELECT "atualizadoEm", "criadoEm", "id", "nome" FROM "TipoHardware";
DROP TABLE "TipoHardware";
ALTER TABLE "new_TipoHardware" RENAME TO "TipoHardware";
CREATE UNIQUE INDEX "TipoHardware_nome_key" ON "TipoHardware"("nome");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CampoHardware_tipoHardwareId_idx" ON "CampoHardware"("tipoHardwareId");

-- CreateIndex
CREATE UNIQUE INDEX "CampoHardware_tipoHardwareId_chave_key" ON "CampoHardware"("tipoHardwareId", "chave");

-- CreateIndex
CREATE INDEX "HardwareValor_hardwareId_idx" ON "HardwareValor"("hardwareId");

-- CreateIndex
CREATE INDEX "HardwareValor_campoHardwareId_idx" ON "HardwareValor"("campoHardwareId");

-- CreateIndex
CREATE UNIQUE INDEX "HardwareValor_hardwareId_campoHardwareId_key" ON "HardwareValor"("hardwareId", "campoHardwareId");
