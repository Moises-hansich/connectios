import { prisma } from "../prisma";

export class EquipamentoRepository {
  async findAll() {
    return prisma.equipamento.findMany({
      orderBy: {
        criadoEm: "desc",
      },
    });
  }
}
