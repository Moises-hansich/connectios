import { prisma } from "../prisma";

export interface ColaboradorFilters {
  search?: string;
  ativo?: boolean;
  localizacaoId?: number;
  page?: number;
  limit?: number;
}

export interface CreateColaboradorData {
  nome: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  localizacaoId?: number | null;
  ativo?: boolean;
}

export class ColaboradorRepository {
  async findAll() {
    return prisma.colaborador.findMany({
      include: {
        localizacao: true,
        equipamentos: {
          include: {
            localizacao: true,
          },
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.colaborador.findUnique({
      where: {
        email,
      },
      include: {
        localizacao: true,
        equipamentos: {
          include: {
            localizacao: true,
          },
        },
      },
    });
  }

  async create(data: CreateColaboradorData) {
    return prisma.colaborador.create({
      data,
      include: {
        localizacao: true,
        equipamentos: {
          include: {
            localizacao: true,
          },
        },
      },
    });
  }

  async findById(id: number) {
    return prisma.colaborador.findUnique({
      where: {
        id,
      },
      include: {
        localizacao: true,
        equipamentos: {
          include: {
            localizacao: true,
          },
        },
      },
    });
  }
  async findCompleto(id: number) {
    return prisma.colaborador.findUnique({
      where: {
        id,
      },

      include: {
        localizacao: true,

        equipamentos: {
          include: {
            localizacao: true,

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

          orderBy: {
            nome: "asc",
          },
        },
      },
    });
  }
  async update(id: number, data: Partial<CreateColaboradorData>) {
    return prisma.colaborador.update({
      where: {
        id,
      },
      data,
      include: {
        localizacao: true,
        equipamentos: {
          include: {
            localizacao: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    return prisma.colaborador.delete({
      where: {
        id,
      },
      include: {
        localizacao: true,
        equipamentos: {
          include: {
            localizacao: true,
          },
        },
      },
    });
  }

  async findWithFilters(filters: ColaboradorFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.ativo !== undefined && {
        ativo: filters.ativo,
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
            email: {
              contains: filters.search,
            },
          },
          {
            telefone: {
              contains: filters.search,
            },
          },
          {
            cargo: {
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
        ],
      }),
    };

    const [colaboradores, total] = await Promise.all([
      prisma.colaborador.findMany({
        where,
        include: {
          localizacao: true,
          equipamentos: {
            include: {
              localizacao: true,
            },
          },
        },
        orderBy: {
          criadoEm: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.colaborador.count({
        where,
      }),
    ]);

    return {
      colaboradores,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
