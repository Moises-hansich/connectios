/*
  Warnings:

  - A unique constraint covering the columns `[zabbixHostId]` on the table `Equipamento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Equipamento" ADD COLUMN "zabbixHostId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_zabbixHostId_key" ON "Equipamento"("zabbixHostId");
