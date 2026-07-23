-- CreateTable
CREATE TABLE "Hardware" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "fabricante" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "observacoes" TEXT,
    "equipamentoId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Hardware_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HardwareAtributo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "unidade" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "hardwareId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "HardwareAtributo_hardwareId_fkey" FOREIGN KEY ("hardwareId") REFERENCES "Hardware" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Hardware_equipamentoId_idx" ON "Hardware"("equipamentoId");

-- CreateIndex
CREATE INDEX "Hardware_tipo_idx" ON "Hardware"("tipo");

-- CreateIndex
CREATE INDEX "HardwareAtributo_hardwareId_idx" ON "HardwareAtributo"("hardwareId");

-- CreateIndex
CREATE UNIQUE INDEX "HardwareAtributo_hardwareId_nome_key" ON "HardwareAtributo"("hardwareId", "nome");
