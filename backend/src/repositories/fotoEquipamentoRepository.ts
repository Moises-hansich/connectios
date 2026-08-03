import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma";

export interface CreateFotoEquipamentoData {
  nomeArquivo: string;
  nomeOriginal: string;
  tipoMime: string;
  tamanho: number;
  principal?: boolean;
  equipamentoId: number;
}

type BancoDados = typeof prisma | Prisma.TransactionClient;

export class FotoEquipamentoRepository {
  async findByEquipamentoId(
    equipamentoId: number,
    bancoDados: BancoDados = prisma,
  ) {
    return bancoDados.fotoEquipamento.findMany({
      where: {
        equipamentoId,
      },

      orderBy: [
        {
          principal: "desc",
        },
        {
          criadoEm: "asc",
        },
        {
          id: "asc",
        },
      ],
    });
  }

  async findById(id: number, bancoDados: BancoDados = prisma) {
    return bancoDados.fotoEquipamento.findUnique({
      where: {
        id,
      },
    });
  }

  async findPrincipalByEquipamentoId(
    equipamentoId: number,
    bancoDados: BancoDados = prisma,
  ) {
    return bancoDados.fotoEquipamento.findFirst({
      where: {
        equipamentoId,
        principal: true,
      },
    });
  }

  async createMany(data: CreateFotoEquipamentoData[]) {
    return prisma.$transaction(async (transaction) => {
      const fotosCriadas = [];

      for (const foto of data) {
        const fotoCriada = await transaction.fotoEquipamento.create({
          data: foto,
        });

        fotosCriadas.push(fotoCriada);
      }

      return fotosCriadas;
    });
  }

  async setPrincipal(id: number, equipamentoId: number) {
    return prisma.$transaction(async (transaction) => {
      const foto = await transaction.fotoEquipamento.findFirst({
        where: {
          id,
          equipamentoId,
        },
      });

      if (!foto) {
        return null;
      }

      await transaction.fotoEquipamento.updateMany({
        where: {
          equipamentoId,
          principal: true,
        },
        data: {
          principal: false,
        },
      });

      return transaction.fotoEquipamento.update({
        where: {
          id,
        },
        data: {
          principal: true,
        },
      });
    });
  }

  async deleteAndPromote(id: number, equipamentoId: number) {
    return prisma.$transaction(async (transaction) => {
      const foto = await transaction.fotoEquipamento.findFirst({
        where: {
          id,
          equipamentoId,
        },
      });

      if (!foto) {
        return null;
      }

      await transaction.fotoEquipamento.delete({
        where: {
          id,
        },
      });

      if (foto.principal) {
        const proximaFoto = await transaction.fotoEquipamento.findFirst({
          where: {
            equipamentoId,
          },
          orderBy: [
            {
              criadoEm: "asc",
            },
            {
              id: "asc",
            },
          ],
        });

        if (proximaFoto) {
          await transaction.fotoEquipamento.update({
            where: {
              id: proximaFoto.id,
            },
            data: {
              principal: true,
            },
          });
        }
      }

      return foto;
    });
  }
}

export const fotoEquipamentoRepository = new FotoEquipamentoRepository();
