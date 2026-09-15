import { prisma } from "../prisma";

export interface CreateLocalizacaoData {
  nome: string;
  descricao?: string;
}

export interface UpdateLocalizacaoData {
  nome?: string;
  descricao?: string;
}

export class LocalizacaoRepository {
  async findAll() {
    return prisma.localizacao.findMany({
      include: {
        equipamentos: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async findById(id: number) {
    return prisma.localizacao.findUnique({
      where: { id },
      include: {
        equipamentos: true,
      },
    });
  }

  async findColaboradores(id: number) {
    return prisma.colaborador.findMany({
      where: {
        localizacaoId: id,
        ativo: true,
      },
      include: {
        setor: true,
        equipamentos: {
          select: {
            id: true,
            nome: true,
            patrimonio: true,
            status: true,
            zabbixHostId: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async create(data: CreateLocalizacaoData) {
    return prisma.localizacao.create({
      data,
    });
  }

  async update(id: number, data: UpdateLocalizacaoData) {
    return prisma.localizacao.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.localizacao.delete({
      where: { id },
    });
  }

  async findByNome(nome: string) {
    return prisma.localizacao.findUnique({
      where: { nome },
    });
  }
}

export const localizacaoRepository = new LocalizacaoRepository();
