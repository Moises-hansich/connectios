import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma";

export interface EquipamentoFilters {
  search?: string;
  categoria?: string;
  categoriaId?: number;
  status?: string;
  localizacaoId?: number;
  page?: number;
  limit?: number;
}

export interface CreateEquipamentoData {
  nome: string;
  categoriaId: number;
  fabricante?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  patrimonio?: string | null;
  status: string;
  setorId?: number | null;
  localizacaoId?: number | null;
  responsavelId?: number | null;
  fornecedorId?: number | null;
  observacoes?: string | null;
  dataCompra?: Date | null;
  garantiaAte?: Date | null;
}

type BancoDados = typeof prisma | Prisma.TransactionClient;

export class EquipamentoRepository {
  async findAll() {
    return prisma.equipamento.findMany({
      include: {
        categoria: true,
        setor: true,
        localizacao: true,
        responsavel: true,
        fornecedor: true,

        fotos: {
          where: {
            principal: true,
          },

          orderBy: {
            criadoEm: "desc",
          },

          take: 1,

          select: {
            id: true,
            nomeArquivo: true,
            nomeOriginal: true,
            principal: true,
          },
        },
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
        categoria: true,
        setor: true,
        localizacao: true,
        responsavel: true,
        fornecedor: true,
      },
    });
  }

  async findByPatrimonio(patrimonio: string) {
    return prisma.equipamento.findUnique({
      where: {
        patrimonio,
      },

      include: {
        categoria: true,
        setor: true,
        localizacao: true,
        responsavel: true,
        fornecedor: true,
      },
    });
  }

  async create(data: CreateEquipamentoData, bancoDados: BancoDados = prisma) {
    return bancoDados.equipamento.create({
      data,

      include: {
        categoria: true,
        setor: true,
        localizacao: true,
        responsavel: true,
        fornecedor: true,
      },
    });
  }

  async findById(id: number, bancoDados: BancoDados = prisma) {
    return bancoDados.equipamento.findUnique({
      where: {
        id,
      },

      include: {
        categoria: true,
        setor: true,
        localizacao: true,
        responsavel: true,
        fornecedor: true,
      },
    });
  }

  async findCompleto(id: number) {
    return prisma.equipamento.findUnique({
      where: {
        id,
      },

      include: {
        categoria: true,
        setor: true,
        localizacao: true,
        responsavel: true,
        fornecedor: true,

        hardware: {
          include: {
            tipoHardware: true,

            valores: {
              include: {
                campoHardware: true,
              },

              orderBy: {
                campoHardware: {
                  ordem: "asc",
                },
              },
            },
          },

          orderBy: {
            tipoHardware: {
              ordem: "asc",
            },
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: Partial<CreateEquipamentoData>,
    bancoDados: BancoDados = prisma,
  ) {
    return bancoDados.equipamento.update({
      where: {
        id,
      },

      data,

      include: {
        categoria: true,
        setor: true,
        localizacao: true,
        responsavel: true,
        fornecedor: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.equipamento.delete({
      where: {
        id,
      },

      include: {
        categoria: true,
        setor: true,
        localizacao: true,
        responsavel: true,
        fornecedor: true,
      },
    });
  }

  async findWithFilters(filters: EquipamentoFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EquipamentoWhereInput = {
      ...(filters.categoriaId !== undefined && {
        categoriaId: filters.categoriaId,
      }),

      ...(filters.categoria && {
        categoria: {
          is: {
            nome: filters.categoria,
          },
        },
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
            categoria: {
              is: {
                nome: {
                  contains: filters.search,
                },
              },
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

          {
            fornecedor: {
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
          categoria: true,
          setor: true,
          localizacao: true,
          responsavel: true,
          fornecedor: true,

          fotos: {
            where: {
              principal: true,
            },

            orderBy: {
              criadoEm: "desc",
            },

            take: 1,

            select: {
              id: true,
              nomeArquivo: true,
              nomeOriginal: true,
              principal: true,
            },
          },
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

export const equipamentoRepository = new EquipamentoRepository();
