import { prisma } from "../prisma";

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
}
