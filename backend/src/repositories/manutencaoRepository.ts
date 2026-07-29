import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma";

export interface ManutencaoFilters {
  equipamentoId?: number;
  status?: string;
  dataInicio?: Date;
  dataFim?: Date;
  page?: number;
  limit?: number;
}

export type CreateManutencaoData = Prisma.ManutencaoUncheckedCreateInput;

export type UpdateManutencaoData = Prisma.ManutencaoUncheckedUpdateInput;

type BancoDados = typeof prisma | Prisma.TransactionClient;

const manutencaoInclude = {
  equipamento: {
    select: {
      id: true,
      nome: true,
      categoria: true,
      patrimonio: true,
      numeroSerie: true,
      status: true,
    },
  },

  responsavelAnterior: true,
  localizacaoAnterior: true,

  registradoPor: {
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
    },
  },

  movimentacoes: {
    select: {
      id: true,
      tipo: true,
      statusAnterior: true,
      statusNovo: true,
      observacoes: true,
      dataHora: true,
    },

    orderBy: [
      {
        dataHora: "desc",
      },
      {
        id: "desc",
      },
    ],
  },
} as const;

export class ManutencaoRepository {
  async findAll() {
    return prisma.manutencao.findMany({
      include: manutencaoInclude,

      orderBy: [
        {
          dataSaida: "desc",
        },
        {
          id: "desc",
        },
      ],
    });
  }

  async findById(id: number, bancoDados: BancoDados = prisma) {
    return bancoDados.manutencao.findUnique({
      where: {
        id,
      },

      include: manutencaoInclude,
    });
  }

  async findByEquipamentoId(equipamentoId: number) {
    return prisma.manutencao.findMany({
      where: {
        equipamentoId,
      },

      include: manutencaoInclude,

      orderBy: [
        {
          dataSaida: "desc",
        },
        {
          id: "desc",
        },
      ],
    });
  }

  async findEmAndamentoByEquipamentoId(
    equipamentoId: number,
    bancoDados: BancoDados = prisma,
  ) {
    return bancoDados.manutencao.findFirst({
      where: {
        equipamentoId,
        status: "EM_ANDAMENTO",
      },

      include: manutencaoInclude,

      orderBy: {
        dataSaida: "desc",
      },
    });
  }

  async create(data: CreateManutencaoData, bancoDados: BancoDados = prisma) {
    return bancoDados.manutencao.create({
      data,
      include: manutencaoInclude,
    });
  }

  async update(
    id: number,
    data: UpdateManutencaoData,
    bancoDados: BancoDados = prisma,
  ) {
    return bancoDados.manutencao.update({
      where: {
        id,
      },

      data,

      include: manutencaoInclude,
    });
  }

  async findWithFilters(filters: ManutencaoFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ManutencaoWhereInput = {
      ...(filters.equipamentoId !== undefined && {
        equipamentoId: filters.equipamentoId,
      }),

      ...(filters.status && {
        status: filters.status,
      }),

      ...((filters.dataInicio || filters.dataFim) && {
        dataSaida: {
          ...(filters.dataInicio && {
            gte: filters.dataInicio,
          }),

          ...(filters.dataFim && {
            lte: filters.dataFim,
          }),
        },
      }),
    };

    const [manutencoes, total] = await Promise.all([
      prisma.manutencao.findMany({
        where,
        include: manutencaoInclude,

        orderBy: [
          {
            dataSaida: "desc",
          },
          {
            id: "desc",
          },
        ],

        skip,
        take: limit,
      }),

      prisma.manutencao.count({
        where,
      }),
    ]);

    return {
      manutencoes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const manutencaoRepository = new ManutencaoRepository();
