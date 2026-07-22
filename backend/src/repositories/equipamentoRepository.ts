import { prisma } from "../prisma";

export interface EquipamentoFilters {
  search?: string;
  categoria?: string;
  status?: string;
  localizacaoId?: number;
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
  localizacaoId?: number | null;
  responsavelId?: number | null;
  observacoes?: string;
}

export class EquipamentoRepository {
  async findAll() {
    return prisma.equipamento.findMany({
      include: {
        localizacao: true,
        responsavel: true,
      },
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
      include: {
        localizacao: true,
        responsavel: true,
      },
    });
  }

  async findByPatrimonio(patrimonio: string) {
    return prisma.equipamento.findUnique({
      where: {
        patrimonio,
      },
      include: {
        localizacao: true,
        responsavel: true,
      },
    });
  }

  async create(data: CreateEquipamentoData) {
    return prisma.equipamento.create({
      data,
      include: {
        localizacao: true,
        responsavel: true,
      },
    });
  }

  async findById(id: number) {
    return prisma.equipamento.findUnique({
      where: {
        id,
      },
      include: {
        localizacao: true,
        responsavel: true,
      },
    });
  }

  async update(id: number, data: Partial<CreateEquipamentoData>) {
    return prisma.equipamento.update({
      where: {
        id,
      },
      data,
      include: {
        localizacao: true,
        responsavel: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.equipamento.delete({
      where: {
        id,
      },
      include: {
        localizacao: true,
        responsavel: true,
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

      ...(filters.localizacaoId !== undefined && {
        localizacaoId: filters.localizacaoId,
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
          {
            localizacao: {
              is: {
                nome: {
                  contains: filters.search,
                },
              },
            },
          },
          {
            responsavel: {
              is: {
                nome: {
                  contains: filters.search,
                },
              },
            },
          },
        ],
      }),
    };

    const [equipamentos, total] = await Promise.all([
      prisma.equipamento.findMany({
        where,
        include: {
          localizacao: true,
          responsavel: true,
        },
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
