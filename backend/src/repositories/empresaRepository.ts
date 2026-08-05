import { prisma } from "../prisma";

export interface CreateEmpresaData {
  nome: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  ativo?: boolean;
}

export interface UpdateEmpresaData {
  nome?: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  ativo?: boolean;
}

export class EmpresaRepository {
  async findAll() {
    return prisma.empresa.findMany({
      include: {
        _count: {
          select: {
            equipamentosFornecidos: true,
            manutencoesRealizadas: true,
          },
        },
      },
      orderBy: [
        {
          ativo: "desc",
        },
        {
          nome: "asc",
        },
      ],
    });
  }

  async findAtivas() {
    return prisma.empresa.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async findById(id: number) {
    return prisma.empresa.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            equipamentosFornecidos: true,
            manutencoesRealizadas: true,
          },
        },
      },
    });
  }

  async findByCnpj(cnpj: string) {
    return prisma.empresa.findUnique({
      where: { cnpj },
    });
  }

  async countEquipamentos(id: number) {
    return prisma.equipamento.count({
      where: {
        fornecedorId: id,
      },
    });
  }

  async countManutencoes(id: number) {
    return prisma.manutencao.count({
      where: {
        empresaResponsavelId: id,
      },
    });
  }

  async create(data: CreateEmpresaData) {
    return prisma.empresa.create({
      data,
    });
  }

  async update(id: number, data: UpdateEmpresaData) {
    return prisma.empresa.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.empresa.delete({
      where: { id },
    });
  }
}

export const empresaRepository = new EmpresaRepository();
