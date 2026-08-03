import { prisma } from "../prisma";

export class SetorRepository {
  async findById(id: number) {
    return prisma.setor.findUnique({
      where: {
        id,
      },
    });
  }
}

export const setorRepository = new SetorRepository();
