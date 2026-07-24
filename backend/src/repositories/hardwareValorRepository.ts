import { prisma } from "../prisma";
import {
  AtualizarHardwareValorInput,
  CriarHardwareValorInput,
} from "../validators/hardwareValorValidator";

class HardwareValorRepository {
  async create(data: CriarHardwareValorInput) {
    return prisma.hardwareValor.create({
      data,
      include: {
        hardware: true,
        campoHardware: true,
      },
    });
  }

  async findAll() {
    return prisma.hardwareValor.findMany({
      include: {
        hardware: true,
        campoHardware: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findById(id: number) {
    return prisma.hardwareValor.findUnique({
      where: {
        id,
      },
      include: {
        hardware: true,
        campoHardware: true,
      },
    });
  }

  async findByHardware(hardwareId: number) {
    return prisma.hardwareValor.findMany({
      where: {
        hardwareId,
      },
      include: {
        campoHardware: true,
      },
      orderBy: {
        campoHardwareId: "asc",
      },
    });
  }

  async findByHardwareECampo(hardwareId: number, campoHardwareId: number) {
    return prisma.hardwareValor.findFirst({
      where: {
        hardwareId,
        campoHardwareId,
      },
    });
  }

  async update(id: number, data: AtualizarHardwareValorInput) {
    return prisma.hardwareValor.update({
      where: {
        id,
      },
      data,
      include: {
        hardware: true,
        campoHardware: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.hardwareValor.delete({
      where: {
        id,
      },
    });
  }
}

export const hardwareValorRepository = new HardwareValorRepository();
