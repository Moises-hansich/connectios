import { prisma } from "../prisma";
import {
  AtualizarCampoHardwareInput,
  CriarCampoHardwareInput,
} from "../validators/campoHardwareValidator";

class CampoHardwareRepository {
  async create(data: CriarCampoHardwareInput) {
    return prisma.campoHardware.create({
      data,
    });
  }

  async findAll() {
    return prisma.campoHardware.findMany({
      include: {
        tipoHardware: true,
      },
      orderBy: [
        {
          tipoHardwareId: "asc",
        },
        {
          ordem: "asc",
        },
      ],
    });
  }

  async findById(id: number) {
    return prisma.campoHardware.findUnique({
      where: {
        id,
      },
      include: {
        tipoHardware: true,
      },
    });
  }

  async findByNome(nome: string, tipoHardwareId: number) {
    return prisma.campoHardware.findFirst({
      where: {
        nome,
        tipoHardwareId,
      },
    });
  }

  async update(id: number, data: AtualizarCampoHardwareInput) {
    return prisma.campoHardware.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number) {
    return prisma.campoHardware.delete({
      where: {
        id,
      },
    });
  }
}

export const campoHardwareRepository = new CampoHardwareRepository();
