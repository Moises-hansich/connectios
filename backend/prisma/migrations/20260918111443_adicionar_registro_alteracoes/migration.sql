-- CreateTable
CREATE TABLE "AlteracaoEquipamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movimentacaoId" INTEGER NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNovo" TEXT,
    "referenciaAnteriorId" INTEGER,
    "referenciaNovaId" INTEGER,
    CONSTRAINT "AlteracaoEquipamento_movimentacaoId_fkey" FOREIGN KEY ("movimentacaoId") REFERENCES "Movimentacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AlteracaoEquipamento_movimentacaoId_campo_key" ON "AlteracaoEquipamento"("movimentacaoId", "campo");
