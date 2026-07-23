import { prisma } from "../prisma";
import {
  CriarTipoHardwareInput,
  AtualizarTipoHardwareInput,
} from "../validators/tipoHardwareValidator";

export class TipoHardwareRepository {
  async create(data: CriarTipoHardwareInput) {
    return prisma.tipoHardware.create({
      data,
    });
  }

  async findAll() {
    return prisma.tipoHardware.findMany({
      orderBy: {
        ordem: "asc",
      },
    });
  }

  async findById(id: number) {
    return prisma.tipoHardware.findUnique({
      where: {
        id,
      },
    });
  }

  async findByNome(nome: string) {
    return prisma.tipoHardware.findFirst({
      where: {
        nome,
      },
    });
  }

  async update(id: number, data: AtualizarTipoHardwareInput) {
    return prisma.tipoHardware.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number) {
    return prisma.tipoHardware.delete({
      where: {
        id,
      },
    });
  }
}

export const tipoHardwareRepository = new TipoHardwareRepository();
