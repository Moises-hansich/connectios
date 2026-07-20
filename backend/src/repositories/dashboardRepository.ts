import { prisma } from "../prisma";

export class DashboardRepository {
  async contarEquipamentos() {
    return prisma.equipamento.count();
  }

  async contarPorStatus(status: string) {
    return prisma.equipamento.count({
      where: {
        status,
      },
    });
  }

  async buscarCategorias() {
    const categorias = await prisma.equipamento.groupBy({
      by: ["categoria"],
      _count: {
        categoria: true,
      },
    });

    return categorias.map((categoria) => ({
      name: categoria.categoria,
      value: categoria._count.categoria,
    }));
  }

  async buscarStatus() {
    const status = await prisma.equipamento.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    return status.map((item) => ({
      name: item.status,
      value: item._count.status,
    }));
  }

  async buscarUltimosEquipamentos() {
    return prisma.equipamento.findMany({
      orderBy: {
        criadoEm: "desc",
      },
      take: 5,
    });
  }
}
