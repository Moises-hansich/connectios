import { prisma } from "../prisma";

export interface CriarUsuarioData {
  nome: string;
  email: string;
  senhaHash: string;
  perfil?: string;
  ativo?: boolean;
}

export interface AtualizarUsuarioData {
  nome?: string;
  email?: string;
  senhaHash?: string;
  perfil?: string;
  ativo?: boolean;
}

export const usuarioRepository = {
  async listar() {
    return prisma.usuario.findMany({
      orderBy: {
        criadoEm: "desc",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });
  },

  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: {
        email,
      },
    });
  },

  async buscarPorId(id: number) {
    return prisma.usuario.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });
  },

  async criar(dados: CriarUsuarioData) {
    return prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senhaHash: dados.senhaHash,
        perfil: dados.perfil ?? "USUARIO",
        ativo: dados.ativo ?? true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });
  },

  async atualizar(id: number, dados: AtualizarUsuarioData) {
    return prisma.usuario.update({
      where: {
        id,
      },
      data: dados,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });
  },

  async alterarStatus(id: number, ativo: boolean) {
    return prisma.usuario.update({
      where: {
        id,
      },
      data: {
        ativo,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });
  },

  async excluir(id: number) {
    return prisma.usuario.delete({
      where: {
        id,
      },
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });
  },
};
