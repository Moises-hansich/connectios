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
    const grupos = await prisma.equipamento.groupBy({
      by: ["categoriaId"],
      _count: {
        _all: true,
      },
    });

    const categoriaIds = grupos.map((grupo) => grupo.categoriaId);

    const categorias =
      categoriaIds.length === 0
        ? []
        : await prisma.categoria.findMany({
            where: {
              id: {
                in: categoriaIds,
              },
            },
            select: {
              id: true,
              nome: true,
            },
          });

    const nomesPorId = new Map(
      categorias.map((categoria) => [categoria.id, categoria.nome]),
    );

    return grupos
      .map((grupo) => ({
        name: nomesPorId.get(grupo.categoriaId) ?? "Categoria não encontrada",
        value: grupo._count._all,
      }))
      .sort((a, b) => b.value - a.value);
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
      include: {
        categoria: true,
        fornecedor: true,
      },
    });
  }

  async buscarGarantiasVencendo(dataInicial: Date, dataFinal: Date) {
    return prisma.equipamento.findMany({
      where: {
        garantiaAte: {
          gte: dataInicial,
          lte: dataFinal,
        },
      },

      select: {
        id: true,
        nome: true,
        patrimonio: true,
        numeroSerie: true,
        status: true,
        garantiaAte: true,
        fornecedorId: true,

        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },

        fornecedor: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            telefone: true,
            email: true,
            ativo: true,
          },
        },
      },

      orderBy: [
        {
          garantiaAte: "asc",
        },
        {
          nome: "asc",
        },
      ],
    });
  }
}
