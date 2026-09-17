import { prisma } from "../prisma";
import type { GrupoCategoria } from "../utils/grupoEquipamento";

export interface CreateCategoriaData {
  nome: string;
  grupo?: GrupoCategoria;
  descricao?: string | null;
  ativo?: boolean;
}

export interface UpdateCategoriaData {
  nome?: string;
  grupo?: GrupoCategoria;
  descricao?: string | null;
  ativo?: boolean;
}

export class CategoriaRepository {
  async findAll() {
    return prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            equipamentos: true,
          },
        },
      },
      orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    });
  }

  async findAtivas() {
    return prisma.categoria.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async findById(id: number) {
    return prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            equipamentos: true,
          },
        },
      },
    });
  }

  async findByNome(nome: string) {
    return prisma.categoria.findUnique({
      where: { nome },
    });
  }

  async countEquipamentos(id: number) {
    return prisma.equipamento.count({
      where: {
        categoriaId: id,
      },
    });
  }

  async create(data: CreateCategoriaData) {
    return prisma.categoria.create({
      data,
    });
  }

  async update(id: number, data: UpdateCategoriaData) {
    return prisma.$transaction(async (tx) => {
      const categoriaAtual = await tx.categoria.findUniqueOrThrow({
        where: { id },
      });

      const alterandoGrupo =
        data.grupo !== undefined && data.grupo !== categoriaAtual.grupo;

      if (alterandoGrupo) {
        const equipamentoComVinculo = await tx.equipamento.findFirst({
          where: {
            categoriaId: id,
            OR: [
              {
                instaladoEmId: {
                  not: null,
                },
              },
              {
                pecasInstaladas: {
                  some: {},
                },
              },
            ],
          },
          select: {
            id: true,
          },
        });

        if (equipamentoComVinculo) {
          throw new Error(
            "Retire as peças instaladas antes de alterar o grupo desta categoria. Existem vínculos com computadores.",
          );
        }
      }

      return tx.categoria.update({
        where: { id },
        data,
      });
    });
  }

  async delete(id: number) {
    return prisma.categoria.delete({
      where: { id },
    });
  }
}

export const categoriaRepository = new CategoriaRepository();
