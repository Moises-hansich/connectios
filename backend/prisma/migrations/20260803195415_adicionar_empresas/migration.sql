-- CreateTable
CREATE TABLE "Empresa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
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
    "fabricante" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "patrimonio" TEXT,
    "status" TEXT NOT NULL,
    "observacoes" TEXT,
    "dataCompra" DATETIME,
    "garantiaAte" DATETIME,
    "fornecedorId" INTEGER,
    "categoriaId" INTEGER NOT NULL,
    "setorId" INTEGER,
    "localizacaoId" INTEGER,
    "responsavelId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Equipamento_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Empresa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipamento" ("atualizadoEm", "categoriaId", "criadoEm", "dataCompra", "fabricante", "garantiaAte", "id", "localizacaoId", "modelo", "nome", "numeroSerie", "observacoes", "patrimonio", "responsavelId", "setorId", "status") SELECT "atualizadoEm", "categoriaId", "criadoEm", "dataCompra", "fabricante", "garantiaAte", "id", "localizacaoId", "modelo", "nome", "numeroSerie", "observacoes", "patrimonio", "responsavelId", "setorId", "status" FROM "Equipamento";
DROP TABLE "Equipamento";
ALTER TABLE "new_Equipamento" RENAME TO "Equipamento";
CREATE UNIQUE INDEX "Equipamento_numeroSerie_key" ON "Equipamento"("numeroSerie");
CREATE UNIQUE INDEX "Equipamento_patrimonio_key" ON "Equipamento"("patrimonio");
CREATE INDEX "Equipamento_categoriaId_idx" ON "Equipamento"("categoriaId");
CREATE INDEX "Equipamento_setorId_idx" ON "Equipamento"("setorId");
CREATE INDEX "Equipamento_localizacaoId_idx" ON "Equipamento"("localizacaoId");
CREATE INDEX "Equipamento_responsavelId_idx" ON "Equipamento"("responsavelId");
CREATE INDEX "Equipamento_fornecedorId_idx" ON "Equipamento"("fornecedorId");
CREATE TABLE "new_Manutencao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipamentoId" INTEGER NOT NULL,
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
    CONSTRAINT "Manutencao_empresaResponsavelId_fkey" FOREIGN KEY ("empresaResponsavelId") REFERENCES "Empresa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_responsavelAnteriorId_fkey" FOREIGN KEY ("responsavelAnteriorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_setorAnteriorId_fkey" FOREIGN KEY ("setorAnteriorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_localizacaoAnteriorId_fkey" FOREIGN KEY ("localizacaoAnteriorId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Manutencao" ("atualizadoEm", "criadoEm", "custo", "dataRetorno", "dataSaida", "diagnostico", "empresaResponsavel", "equipamentoId", "id", "localManutencao", "localizacaoAnteriorId", "observacoes", "previsaoRetorno", "problemaInformado", "registradoPorId", "responsavelAnteriorId", "setorAnteriorId", "solucao", "status", "statusAnterior") SELECT "atualizadoEm", "criadoEm", "custo", "dataRetorno", "dataSaida", "diagnostico", "empresaResponsavel", "equipamentoId", "id", "localManutencao", "localizacaoAnteriorId", "observacoes", "previsaoRetorno", "problemaInformado", "registradoPorId", "responsavelAnteriorId", "setorAnteriorId", "solucao", "status", "statusAnterior" FROM "Manutencao";
DROP TABLE "Manutencao";
ALTER TABLE "new_Manutencao" RENAME TO "Manutencao";
CREATE INDEX "Manutencao_equipamentoId_idx" ON "Manutencao"("equipamentoId");
CREATE INDEX "Manutencao_responsavelAnteriorId_idx" ON "Manutencao"("responsavelAnteriorId");
CREATE INDEX "Manutencao_setorAnteriorId_idx" ON "Manutencao"("setorAnteriorId");
CREATE INDEX "Manutencao_localizacaoAnteriorId_idx" ON "Manutencao"("localizacaoAnteriorId");
CREATE INDEX "Manutencao_registradoPorId_idx" ON "Manutencao"("registradoPorId");
CREATE INDEX "Manutencao_status_idx" ON "Manutencao"("status");
CREATE INDEX "Manutencao_dataSaida_idx" ON "Manutencao"("dataSaida");
CREATE INDEX "Manutencao_empresaResponsavelId_idx" ON "Manutencao"("empresaResponsavelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE INDEX "Empresa_nome_idx" ON "Empresa"("nome");

-- CreateIndex
CREATE INDEX "Empresa_ativo_idx" ON "Empresa"("ativo");
