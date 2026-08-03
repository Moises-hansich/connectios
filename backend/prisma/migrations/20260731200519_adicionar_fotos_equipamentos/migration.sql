-- CreateTable
CREATE TABLE "FotoEquipamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeArquivo" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "equipamentoId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "FotoEquipamento_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FotoEquipamento_nomeArquivo_key" ON "FotoEquipamento"("nomeArquivo");

-- CreateIndex
CREATE INDEX "FotoEquipamento_equipamentoId_idx" ON "FotoEquipamento"("equipamentoId");

-- CreateIndex
CREATE INDEX "FotoEquipamento_equipamentoId_principal_idx" ON "FotoEquipamento"("equipamentoId", "principal");
