-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Manutencao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipamentoId" INTEGER NOT NULL,
    "tipo" TEXT,
    "tecnicoResponsavelId" INTEGER,
    "problemaInformado" TEXT NOT NULL,
    "diagnostico" TEXT,
    "solucao" TEXT,
    "localManutencao" TEXT,
    "empresaResponsavel" TEXT,
    "empresaResponsavelId" INTEGER,
    "dataSaida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previsaoRetorno" DATETIME,
    "dataRetorno" DATETIME,
    "custo" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "observacoes" TEXT,
    "responsavelAnteriorId" INTEGER,
    "setorAnteriorId" INTEGER,
    "localizacaoAnteriorId" INTEGER,
    "statusAnterior" TEXT NOT NULL,
    "registradoPorId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Manutencao_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_tecnicoResponsavelId_fkey" FOREIGN KEY ("tecnicoResponsavelId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_empresaResponsavelId_fkey" FOREIGN KEY ("empresaResponsavelId") REFERENCES "Empresa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_responsavelAnteriorId_fkey" FOREIGN KEY ("responsavelAnteriorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_setorAnteriorId_fkey" FOREIGN KEY ("setorAnteriorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_localizacaoAnteriorId_fkey" FOREIGN KEY ("localizacaoAnteriorId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Manutencao" ("atualizadoEm", "criadoEm", "custo", "dataRetorno", "dataSaida", "diagnostico", "empresaResponsavel", "empresaResponsavelId", "equipamentoId", "id", "localManutencao", "localizacaoAnteriorId", "observacoes", "previsaoRetorno", "problemaInformado", "registradoPorId", "responsavelAnteriorId", "setorAnteriorId", "solucao", "status", "statusAnterior") SELECT "atualizadoEm", "criadoEm", "custo", "dataRetorno", "dataSaida", "diagnostico", "empresaResponsavel", "empresaResponsavelId", "equipamentoId", "id", "localManutencao", "localizacaoAnteriorId", "observacoes", "previsaoRetorno", "problemaInformado", "registradoPorId", "responsavelAnteriorId", "setorAnteriorId", "solucao", "status", "statusAnterior" FROM "Manutencao";
DROP TABLE "Manutencao";
ALTER TABLE "new_Manutencao" RENAME TO "Manutencao";
CREATE INDEX "Manutencao_equipamentoId_idx" ON "Manutencao"("equipamentoId");
CREATE INDEX "Manutencao_tipo_idx" ON "Manutencao"("tipo");
CREATE INDEX "Manutencao_tecnicoResponsavelId_idx" ON "Manutencao"("tecnicoResponsavelId");
CREATE INDEX "Manutencao_responsavelAnteriorId_idx" ON "Manutencao"("responsavelAnteriorId");
CREATE INDEX "Manutencao_setorAnteriorId_idx" ON "Manutencao"("setorAnteriorId");
CREATE INDEX "Manutencao_localizacaoAnteriorId_idx" ON "Manutencao"("localizacaoAnteriorId");
CREATE INDEX "Manutencao_registradoPorId_idx" ON "Manutencao"("registradoPorId");
CREATE INDEX "Manutencao_status_idx" ON "Manutencao"("status");
CREATE INDEX "Manutencao_dataSaida_idx" ON "Manutencao"("dataSaida");
CREATE INDEX "Manutencao_empresaResponsavelId_idx" ON "Manutencao"("empresaResponsavelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
