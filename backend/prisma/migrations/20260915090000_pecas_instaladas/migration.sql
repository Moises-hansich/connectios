-- Campos opcionais: os equipamentos existentes permanecem sem vínculo.
ALTER TABLE "Equipamento" ADD COLUMN "instaladoEmId" INTEGER REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Equipamento" ADD COLUMN "localReservaId" INTEGER REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Equipamento" ADD COLUMN "setorReservaId" INTEGER REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Equipamento_instaladoEmId_idx" ON "Equipamento"("instaladoEmId");
