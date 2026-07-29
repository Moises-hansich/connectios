-- CreateTable
CREATE TABLE "Setor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "responsavelAnteriorId" INTEGER,
    "responsavelNovoId" INTEGER,
    "localizacaoAnteriorId" INTEGER,
    "localizacaoNovaId" INTEGER,
    "setorAnteriorId" INTEGER,
    "setorNovoId" INTEGER,
    "manutencaoId" INTEGER,
    "usuarioId" INTEGER,
    "statusAnterior" TEXT,
    "statusNovo" TEXT,
    "observacoes" TEXT,
    "dataHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movimentacao_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_responsavelAnteriorId_fkey" FOREIGN KEY ("responsavelAnteriorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_responsavelNovoId_fkey" FOREIGN KEY ("responsavelNovoId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_localizacaoAnteriorId_fkey" FOREIGN KEY ("localizacaoAnteriorId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_localizacaoNovaId_fkey" FOREIGN KEY ("localizacaoNovaId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_setorAnteriorId_fkey" FOREIGN KEY ("setorAnteriorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_setorNovoId_fkey" FOREIGN KEY ("setorNovoId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Manutencao" (
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
    "localizacaoAnteriorId" INTEGER,
    "setorAnteriorId" INTEGER,
    "statusAnterior" TEXT NOT NULL,
    "registradoPorId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Manutencao_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_responsavelAnteriorId_fkey" FOREIGN KEY ("responsavelAnteriorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_localizacaoAnteriorId_fkey" FOREIGN KEY ("localizacaoAnteriorId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_setorAnteriorId_fkey" FOREIGN KEY ("setorAnteriorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "localizacaoId" INTEGER,
    "setorId" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Colaborador_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Colaborador_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Colaborador" ("ativo", "atualizadoEm", "cargo", "criadoEm", "email", "id", "localizacaoId", "nome", "telefone") SELECT "ativo", "atualizadoEm", "cargo", "criadoEm", "email", "id", "localizacaoId", "nome", "telefone" FROM "Colaborador";
DROP TABLE "Colaborador";
ALTER TABLE "new_Colaborador" RENAME TO "Colaborador";
CREATE UNIQUE INDEX "Colaborador_email_key" ON "Colaborador"("email");
CREATE INDEX "Colaborador_localizacaoId_idx" ON "Colaborador"("localizacaoId");
CREATE INDEX "Colaborador_setorId_idx" ON "Colaborador"("setorId");
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
    "setorId" INTEGER,
    "responsavelId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Equipamento_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipamento" ("atualizadoEm", "categoria", "criadoEm", "fabricante", "id", "localizacaoId", "modelo", "nome", "numeroSerie", "observacoes", "patrimonio", "responsavelId", "status") SELECT "atualizadoEm", "categoria", "criadoEm", "fabricante", "id", "localizacaoId", "modelo", "nome", "numeroSerie", "observacoes", "patrimonio", "responsavelId", "status" FROM "Equipamento";
DROP TABLE "Equipamento";
ALTER TABLE "new_Equipamento" RENAME TO "Equipamento";
CREATE UNIQUE INDEX "Equipamento_numeroSerie_key" ON "Equipamento"("numeroSerie");
CREATE UNIQUE INDEX "Equipamento_patrimonio_key" ON "Equipamento"("patrimonio");
CREATE INDEX "Equipamento_localizacaoId_idx" ON "Equipamento"("localizacaoId");
CREATE INDEX "Equipamento_setorId_idx" ON "Equipamento"("setorId");
CREATE INDEX "Equipamento_responsavelId_idx" ON "Equipamento"("responsavelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Setor_nome_key" ON "Setor"("nome");

-- CreateIndex
CREATE INDEX "Movimentacao_equipamentoId_dataHora_idx" ON "Movimentacao"("equipamentoId", "dataHora");

-- CreateIndex
CREATE INDEX "Movimentacao_responsavelAnteriorId_idx" ON "Movimentacao"("responsavelAnteriorId");

-- CreateIndex
CREATE INDEX "Movimentacao_responsavelNovoId_idx" ON "Movimentacao"("responsavelNovoId");

-- CreateIndex
CREATE INDEX "Movimentacao_localizacaoAnteriorId_idx" ON "Movimentacao"("localizacaoAnteriorId");

-- CreateIndex
CREATE INDEX "Movimentacao_localizacaoNovaId_idx" ON "Movimentacao"("localizacaoNovaId");

-- CreateIndex
CREATE INDEX "Movimentacao_setorAnteriorId_idx" ON "Movimentacao"("setorAnteriorId");

-- CreateIndex
CREATE INDEX "Movimentacao_setorNovoId_idx" ON "Movimentacao"("setorNovoId");

-- CreateIndex
CREATE INDEX "Movimentacao_manutencaoId_idx" ON "Movimentacao"("manutencaoId");

-- CreateIndex
CREATE INDEX "Movimentacao_usuarioId_idx" ON "Movimentacao"("usuarioId");

-- CreateIndex
CREATE INDEX "Movimentacao_tipo_idx" ON "Movimentacao"("tipo");

-- CreateIndex
CREATE INDEX "Manutencao_equipamentoId_idx" ON "Manutencao"("equipamentoId");

-- CreateIndex
CREATE INDEX "Manutencao_responsavelAnteriorId_idx" ON "Manutencao"("responsavelAnteriorId");

-- CreateIndex
CREATE INDEX "Manutencao_localizacaoAnteriorId_idx" ON "Manutencao"("localizacaoAnteriorId");

-- CreateIndex
CREATE INDEX "Manutencao_setorAnteriorId_idx" ON "Manutencao"("setorAnteriorId");

-- CreateIndex
CREATE INDEX "Manutencao_registradoPorId_idx" ON "Manutencao"("registradoPorId");

-- CreateIndex
CREATE INDEX "Manutencao_status_idx" ON "Manutencao"("status");

-- CreateIndex
CREATE INDEX "Manutencao_dataSaida_idx" ON "Manutencao"("dataSaida");
