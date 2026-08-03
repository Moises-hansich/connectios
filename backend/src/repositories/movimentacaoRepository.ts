import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma";

export interface MovimentacaoFilters {
  equipamentoId?: number;
  tipo?: string;
  usuarioId?: number;
  dataInicio?: Date;
  dataFim?: Date;
  page?: number;
  limit?: number;
}

export interface CreateMovimentacaoData {
  tipo: string;
  equipamentoId: number;
  equipamentoRelacionadoId?: number | null;
  responsavelAnteriorId?: number | null;
  responsavelNovoId?: number | null;
  setorAnteriorId?: number | null;
  setorNovoId?: number | null;
  localizacaoAnteriorId?: number | null;
  localizacaoNovaId?: number | null;
  manutencaoId?: number | null;
  usuarioId?: number | null;
  statusAnterior?: string | null;
  statusNovo?: string | null;
  observacoes?: string | null;
  dataHora?: Date;
}

type BancoDados = typeof prisma | Prisma.TransactionClient;

const movimentacaoInclude = {
  equipamento: {
    select: {
      id: true,
      nome: true,
      categoria: true,
      fabricante: true,
      modelo: true,
      patrimonio: true,
      numeroSerie: true,
      status: true,
    },
  },

  equipamentoRelacionado: {
    select: {
      id: true,
      nome: true,
      categoria: true,
      fabricante: true,
      modelo: true,
      patrimonio: true,
      numeroSerie: true,
      status: true,
    },
  },

  responsavelAnterior: true,
  responsavelNovo: true,

  setorAnterior: true,
  setorNovo: true,

  localizacaoAnterior: true,
  localizacaoNova: true,

  manutencao: {
    select: {
      id: true,
      problemaInformado: true,
      diagnostico: true,
      solucao: true,
      status: true,
      dataSaida: true,
      dataRetorno: true,
    },
  },

  usuario: {
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
    },
  },
} satisfies Prisma.MovimentacaoInclude;

export class MovimentacaoRepository {
  async findAll() {
    return prisma.movimentacao.findMany({
      include: movimentacaoInclude,
      orderBy: [
        {
          dataHora: "desc",
        },
        {
          id: "desc",
        },
      ],
    });
  }

  async findById(id: number, bancoDados: BancoDados = prisma) {
    return bancoDados.movimentacao.findUnique({
      where: {
        id,
      },
      include: movimentacaoInclude,
    });
  }

  async findByEquipamentoId(equipamentoId: number) {
    return prisma.movimentacao.findMany({
      where: {
        OR: [
          {
            equipamentoId,
          },
          {
            equipamentoRelacionadoId: equipamentoId,
          },
        ],
      },
      include: movimentacaoInclude,
      orderBy: [
        {
          dataHora: "desc",
        },
        {
          id: "desc",
        },
      ],
    });
  }

  async create(
    data: CreateMovimentacaoData,
    bancoDados: BancoDados = prisma,
  ) {
    return bancoDados.movimentacao.create({
      data,
      include: movimentacaoInclude,
    });
  }

  async findWithFilters(filters: MovimentacaoFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MovimentacaoWhereInput = {
      ...(filters.equipamentoId !== undefined && {
        OR: [
          {
            equipamentoId: filters.equipamentoId,
          },
          {
            equipamentoRelacionadoId: filters.equipamentoId,
          },
        ],
      }),

      ...(filters.tipo && {
        tipo: filters.tipo,
      }),

      ...(filters.usuarioId !== undefined && {
        usuarioId: filters.usuarioId,
      }),

      ...((filters.dataInicio || filters.dataFim) && {
        dataHora: {
          ...(filters.dataInicio && {
            gte: filters.dataInicio,
          }),
          ...(filters.dataFim && {
            lte: filters.dataFim,
          }),
        },
      }),
    };

    const [movimentacoes, total] = await Promise.all([
      prisma.movimentacao.findMany({
        where,
        include: movimentacaoInclude,
        orderBy: [
          {
            dataHora: "desc",
          },
          {
            id: "desc",
          },
        ],
        skip,
        take: limit,
      }),

      prisma.movimentacao.count({
        where,
      }),
    ]);

    return {
      movimentacoes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const movimentacaoRepository = new MovimentacaoRepository();
