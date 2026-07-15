import { prisma } from "../prisma";

export interface EquipamentoFilters {
  search?: string;
  categoria?: string;
  status?: string;
  page?: number;
  limit?: number;
}
export interface CreateEquipamentoData {
  nome: string;
  categoria: string;
  fabricante?: string;
  modelo?: string;
  numeroSerie?: string;
  patrimonio?: string;
  status: string;
  localizacao?: string;
  observacoes?: string;
}

export class EquipamentoRepository {
  async findAll() {
    return prisma.equipamento.findMany({
      orderBy: {
        criadoEm: "desc",
      },
    });
  }

  async findByNumeroSerie(numeroSerie: string) {
    return prisma.equipamento.findUnique({
      where: {
        numeroSerie,
      },
    });
  }

  async findByPatrimonio(patrimonio: string) {
    return prisma.equipamento.findUnique({
      where: {
        patrimonio,
      },
    });
  }

  async create(data: CreateEquipamentoData) {
    return prisma.equipamento.create({
      data,
    });
  }

  async findById(id: number) {
    return prisma.equipamento.findUnique({
      where: {
        id,
      },
    });
  }
  async update(id: number, data: Partial<CreateEquipamentoData>) {
    return prisma.equipamento.update({
      where: {
        id,
      },
      data,
    });
  }
  async delete(id: number) {
    return prisma.equipamento.delete({
      where: {
        id,
      },
    });
  }
  async findWithFilters(filters: EquipamentoFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.categoria && {
        categoria: filters.categoria,
      }),

      ...(filters.status && {
        status: filters.status,
      }),

      ...(filters.search && {
        OR: [
          {
            nome: {
              contains: filters.search,
            },
          },
          {
            fabricante: {
              contains: filters.search,
            },
          },
          {
            modelo: {
              contains: filters.search,
            },
          },
          {
            numeroSerie: {
              contains: filters.search,
            },
          },
          {
            patrimonio: {
              contains: filters.search,
            },
          },
        ],
      }),
    };

    const [equipamentos, total] = await Promise.all([
      prisma.equipamento.findMany({
        where,
        orderBy: {
          criadoEm: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.equipamento.count({
        where,
      }),
    ]);

    return {
      equipamentos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
