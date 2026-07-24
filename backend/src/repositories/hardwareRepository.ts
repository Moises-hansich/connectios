import { prisma } from "../prisma";
import {
  AtualizarHardwareInput,
  CriarHardwareInput,
} from "../validators/hardwareValidator";

class HardwareRepository {
  async create(data: CriarHardwareInput) {
    return prisma.hardware.create({
      data,
      include: {
        equipamento: true,
        tipoHardware: true,
      },
    });
  }

  async findAll() {
    return prisma.hardware.findMany({
      include: {
        equipamento: true,
        tipoHardware: true,
        valores: {
          include: {
            campoHardware: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findById(id: number) {
    return prisma.hardware.findUnique({
      where: {
        id,
      },
      include: {
        equipamento: true,
        tipoHardware: true,
        valores: {
          include: {
            campoHardware: true,
          },
        },
      },
    });
  }

  async findByNome(nome: string, equipamentoId: number) {
    return prisma.hardware.findFirst({
      where: {
        nome,
        equipamentoId,
      },
    });
  }

  async update(id: number, data: AtualizarHardwareInput) {
    return prisma.hardware.update({
      where: {
        id,
      },
      data,
      include: {
        equipamento: true,
        tipoHardware: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.hardware.delete({
      where: {
        id,
      },
    });
  }
}

export const hardwareRepository = new HardwareRepository();
