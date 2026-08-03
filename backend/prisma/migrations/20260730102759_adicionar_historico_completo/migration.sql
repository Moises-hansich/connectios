-- CreateTable
CREATE TABLE "Setor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Colaborador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cargo" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "setorId" INTEGER,
    "localizacaoId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Colaborador_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Colaborador_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Colaborador" ("ativo", "atualizadoEm", "cargo", "criadoEm", "email", "id", "localizacaoId", "nome", "telefone") SELECT "ativo", "atualizadoEm", "cargo", "criadoEm", "email", "id", "localizacaoId", "nome", "telefone" FROM "Colaborador";
DROP TABLE "Colaborador";
ALTER TABLE "new_Colaborador" RENAME TO "Colaborador";
CREATE UNIQUE INDEX "Colaborador_email_key" ON "Colaborador"("email");
CREATE INDEX "Colaborador_setorId_idx" ON "Colaborador"("setorId");
CREATE INDEX "Colaborador_localizacaoId_idx" ON "Colaborador"("localizacaoId");
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
    "setorId" INTEGER,
    "localizacaoId" INTEGER,
    "responsavelId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Equipamento_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipamento" ("atualizadoEm", "categoria", "criadoEm", "fabricante", "id", "localizacaoId", "modelo", "nome", "numeroSerie", "observacoes", "patrimonio", "responsavelId", "status") SELECT "atualizadoEm", "categoria", "criadoEm", "fabricante", "id", "localizacaoId", "modelo", "nome", "numeroSerie", "observacoes", "patrimonio", "responsavelId", "status" FROM "Equipamento";
DROP TABLE "Equipamento";
ALTER TABLE "new_Equipamento" RENAME TO "Equipamento";
CREATE UNIQUE INDEX "Equipamento_numeroSerie_key" ON "Equipamento"("numeroSerie");
CREATE UNIQUE INDEX "Equipamento_patrimonio_key" ON "Equipamento"("patrimonio");
CREATE INDEX "Equipamento_setorId_idx" ON "Equipamento"("setorId");
CREATE INDEX "Equipamento_localizacaoId_idx" ON "Equipamento"("localizacaoId");
CREATE INDEX "Equipamento_responsavelId_idx" ON "Equipamento"("responsavelId");
CREATE TABLE "new_Manutencao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipamentoId" INTEGER NOT NULL,
    "problemaInformado" TEXT NOT NULL,
    "diagnostico" TEXT,
    "solucao" TEXT,
    "localManutencao" TEXT,
    "empresaResponsavel" TEXT,
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
    CONSTRAINT "Manutencao_responsavelAnteriorId_fkey" FOREIGN KEY ("responsavelAnteriorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_setorAnteriorId_fkey" FOREIGN KEY ("setorAnteriorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_localizacaoAnteriorId_fkey" FOREIGN KEY ("localizacaoAnteriorId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Manutencao" ("atualizadoEm", "criadoEm", "custo", "dataRetorno", "dataSaida", "diagnostico", "empresaResponsavel", "equipamentoId", "id", "localManutencao", "localizacaoAnteriorId", "observacoes", "previsaoRetorno", "problemaInformado", "registradoPorId", "responsavelAnteriorId", "solucao", "status", "statusAnterior") SELECT "atualizadoEm", "criadoEm", "custo", "dataRetorno", "dataSaida", "diagnostico", "empresaResponsavel", "equipamentoId", "id", "localManutencao", "localizacaoAnteriorId", "observacoes", "previsaoRetorno", "problemaInformado", "registradoPorId", "responsavelAnteriorId", "solucao", "status", "statusAnterior" FROM "Manutencao";
DROP TABLE "Manutencao";
ALTER TABLE "new_Manutencao" RENAME TO "Manutencao";
CREATE INDEX "Manutencao_equipamentoId_idx" ON "Manutencao"("equipamentoId");
CREATE INDEX "Manutencao_responsavelAnteriorId_idx" ON "Manutencao"("responsavelAnteriorId");
CREATE INDEX "Manutencao_setorAnteriorId_idx" ON "Manutencao"("setorAnteriorId");
CREATE INDEX "Manutencao_localizacaoAnteriorId_idx" ON "Manutencao"("localizacaoAnteriorId");
CREATE INDEX "Manutencao_registradoPorId_idx" ON "Manutencao"("registradoPorId");
CREATE INDEX "Manutencao_status_idx" ON "Manutencao"("status");
CREATE INDEX "Manutencao_dataSaida_idx" ON "Manutencao"("dataSaida");
CREATE TABLE "new_Movimentacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "equipamentoRelacionadoId" INTEGER,
    "responsavelAnteriorId" INTEGER,
    "responsavelNovoId" INTEGER,
    "setorAnteriorId" INTEGER,
    "setorNovoId" INTEGER,
    "localizacaoAnteriorId" INTEGER,
    "localizacaoNovaId" INTEGER,
    "manutencaoId" INTEGER,
    "usuarioId" INTEGER,
    "statusAnterior" TEXT,
    "statusNovo" TEXT,
    "observacoes" TEXT,
    "dataHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movimentacao_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_equipamentoRelacionadoId_fkey" FOREIGN KEY ("equipamentoRelacionadoId") REFERENCES "Equipamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_responsavelAnteriorId_fkey" FOREIGN KEY ("responsavelAnteriorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_responsavelNovoId_fkey" FOREIGN KEY ("responsavelNovoId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_setorAnteriorId_fkey" FOREIGN KEY ("setorAnteriorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_setorNovoId_fkey" FOREIGN KEY ("setorNovoId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_localizacaoAnteriorId_fkey" FOREIGN KEY ("localizacaoAnteriorId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_localizacaoNovaId_fkey" FOREIGN KEY ("localizacaoNovaId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Movimentacao" ("criadoEm", "dataHora", "equipamentoId", "id", "localizacaoAnteriorId", "localizacaoNovaId", "manutencaoId", "observacoes", "responsavelAnteriorId", "responsavelNovoId", "statusAnterior", "statusNovo", "tipo", "usuarioId") SELECT "criadoEm", "dataHora", "equipamentoId", "id", "localizacaoAnteriorId", "localizacaoNovaId", "manutencaoId", "observacoes", "responsavelAnteriorId", "responsavelNovoId", "statusAnterior", "statusNovo", "tipo", "usuarioId" FROM "Movimentacao";
DROP TABLE "Movimentacao";
ALTER TABLE "new_Movimentacao" RENAME TO "Movimentacao";
CREATE INDEX "Movimentacao_equipamentoId_dataHora_idx" ON "Movimentacao"("equipamentoId", "dataHora");
CREATE INDEX "Movimentacao_equipamentoRelacionadoId_idx" ON "Movimentacao"("equipamentoRelacionadoId");
CREATE INDEX "Movimentacao_responsavelAnteriorId_idx" ON "Movimentacao"("responsavelAnteriorId");
CREATE INDEX "Movimentacao_responsavelNovoId_idx" ON "Movimentacao"("responsavelNovoId");
CREATE INDEX "Movimentacao_setorAnteriorId_idx" ON "Movimentacao"("setorAnteriorId");
CREATE INDEX "Movimentacao_setorNovoId_idx" ON "Movimentacao"("setorNovoId");
CREATE INDEX "Movimentacao_localizacaoAnteriorId_idx" ON "Movimentacao"("localizacaoAnteriorId");
CREATE INDEX "Movimentacao_localizacaoNovaId_idx" ON "Movimentacao"("localizacaoNovaId");
CREATE INDEX "Movimentacao_manutencaoId_idx" ON "Movimentacao"("manutencaoId");
CREATE INDEX "Movimentacao_usuarioId_idx" ON "Movimentacao"("usuarioId");
CREATE INDEX "Movimentacao_tipo_idx" ON "Movimentacao"("tipo");
CREATE INDEX "Movimentacao_dataHora_idx" ON "Movimentacao"("dataHora");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Setor_nome_key" ON "Setor"("nome");
