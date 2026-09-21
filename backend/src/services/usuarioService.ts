import { prisma } from "../prisma";
import type { Prisma } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

import {
  usuarioRepository,
  type AtualizarUsuarioData,
} from "../repositories/usuarioRepository";

interface CriarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  perfil?: string;
  ativo?: boolean;
}

interface AtualizarUsuarioInput {
  nome?: string;
  email?: string;
  senha?: string;
  perfil?: string;
  ativo?: boolean;
}

const PERFIS_VALIDOS = ["ADMIN", "TECNICO", "CONSULTA", "USUARIO"];

function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

function validarPerfil(perfil: string) {
  if (!PERFIS_VALIDOS.includes(perfil)) {
    throw new Error(
      "Perfil inválido. Utilize ADMIN, TECNICO, CONSULTA ou USUARIO.",
    );
  }
}
const usuarioPublicoSelect = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  ativo: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.UsuarioSelect;

async function validarAdministrador(
  tx: Prisma.TransactionClient,
  usuarioLogadoId: number | undefined,
) {
  if (
    usuarioLogadoId === undefined ||
    !Number.isSafeInteger(usuarioLogadoId) ||
    usuarioLogadoId <= 0
  ) {
    throw new Error("Usuário não autenticado.");
  }

  const administrador = await tx.usuario.findUnique({
    where: { id: usuarioLogadoId },
    select: {
      id: true,
      ativo: true,
      perfil: true,
    },
  });

  if (
    !administrador ||
    !administrador.ativo ||
    administrador.perfil !== "ADMIN"
  ) {
    throw new Error("Acesso permitido apenas para administradores ativos.");
  }

  return administrador.id;
}

async function protegerUltimoAdministrador(
  tx: Prisma.TransactionClient,
  usuario: {
    id: number;
    perfil: string;
    ativo: boolean;
  },
  perfilFinal: string,
  ativoFinal: boolean,
) {
  const deixaDeSerAdministradorAtivo =
    usuario.perfil === "ADMIN" &&
    usuario.ativo &&
    (perfilFinal !== "ADMIN" || !ativoFinal);

  if (!deixaDeSerAdministradorAtivo) {
    return;
  }

  const outrosAdministradores = await tx.usuario.count({
    where: {
      perfil: "ADMIN",
      ativo: true,
      id: { not: usuario.id },
    },
  });

  if (outrosAdministradores === 0) {
    throw new Error(
      "Não é possível remover ou desativar o último administrador ativo.",
    );
  }
}
export const usuarioService = {
  async listar() {
    return usuarioRepository.listar();
  },

  async buscarPorId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID do usuário inválido.");
    }

    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    return usuario;
  },

  async criar(dados: CriarUsuarioInput) {
    const nome = dados.nome?.trim();
    const email = normalizarEmail(dados.email ?? "");
    const senha = dados.senha;
    const perfil = dados.perfil?.toUpperCase() ?? "USUARIO";

    if (!nome) {
      throw new Error("O nome é obrigatório.");
    }

    if (!email) {
      throw new Error("O e-mail é obrigatório.");
    }

    if (!senha || senha.length < 6) {
      throw new Error("A senha deve possuir pelo menos 6 caracteres.");
    }

    validarPerfil(perfil);

    const usuarioExistente = await usuarioRepository.buscarPorEmail(email);

    if (usuarioExistente) {
      throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    return usuarioRepository.criar({
      nome,
      email,
      senhaHash,
      perfil,
      ativo: dados.ativo ?? true,
    });
  },

  async atualizar(
    id: number,
    dados: AtualizarUsuarioInput,
    usuarioLogadoId?: number,
  ) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("ID do usuário inválido.");
    }

    const dadosAtualizados: AtualizarUsuarioData = {};

    if (dados.nome !== undefined) {
      if (typeof dados.nome !== "string" || dados.nome.trim().length < 3) {
        throw new Error("O nome deve possuir pelo menos 3 caracteres.");
      }

      dadosAtualizados.nome = dados.nome.trim();
    }

    if (dados.email !== undefined) {
      if (typeof dados.email !== "string") {
        throw new Error("Informe um e-mail válido.");
      }

      const email = normalizarEmail(dados.email);

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Informe um e-mail válido.");
      }

      dadosAtualizados.email = email;
    }

    if (dados.perfil !== undefined) {
      if (typeof dados.perfil !== "string") {
        throw new Error("Perfil inválido.");
      }

      const perfil = dados.perfil.trim().toUpperCase();

      validarPerfil(perfil);
      dadosAtualizados.perfil = perfil;
    }

    if (dados.ativo !== undefined) {
      if (typeof dados.ativo !== "boolean") {
        throw new Error("O campo ativo deve ser verdadeiro ou falso.");
      }

      dadosAtualizados.ativo = dados.ativo;
    }

    if (dados.senha !== undefined) {
      if (typeof dados.senha !== "string" || dados.senha.length < 6) {
        throw new Error("A senha deve possuir pelo menos 6 caracteres.");
      }

      if (Buffer.byteLength(dados.senha, "utf8") > 72) {
        throw new Error("A senha excede o limite de 72 bytes.");
      }

      dadosAtualizados.senhaHash = await bcrypt.hash(dados.senha, 10);
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      throw new Error("Nenhum dado foi informado para atualização.");
    }

    return prisma.$transaction(async (tx) => {
      const administradorId = await validarAdministrador(tx, usuarioLogadoId);

      const usuarioAtual = await tx.usuario.findUnique({
        where: { id },
        select: usuarioPublicoSelect,
      });

      if (!usuarioAtual) {
        throw new Error("Usuário não encontrado.");
      }

      const perfilFinal = dadosAtualizados.perfil ?? usuarioAtual.perfil;

      const ativoFinal = dadosAtualizados.ativo ?? usuarioAtual.ativo;

      await protegerUltimoAdministrador(
        tx,
        usuarioAtual,
        perfilFinal,
        ativoFinal,
      );

      if (id === administradorId && !ativoFinal) {
        throw new Error("Você não pode desativar a própria conta.");
      }

      if (id === administradorId && perfilFinal !== usuarioAtual.perfil) {
        throw new Error(
          "Solicite a outro administrador a alteração do seu perfil.",
        );
      }

      if (dadosAtualizados.email !== undefined) {
        const usuarioComEmail = await tx.usuario.findUnique({
          where: { email: dadosAtualizados.email },
          select: { id: true },
        });

        if (usuarioComEmail && usuarioComEmail.id !== id) {
          throw new Error("Já existe outro usuário com este e-mail.");
        }
      }

      return tx.usuario.update({
        where: { id },
        data: dadosAtualizados,
        select: usuarioPublicoSelect,
      });
    });
  },

  async alterarStatus(id: number, ativo: boolean, usuarioLogadoId?: number) {
    if (typeof ativo !== "boolean") {
      throw new Error("O campo ativo deve ser verdadeiro ou falso.");
    }

    return usuarioService.atualizar(id, { ativo }, usuarioLogadoId);
  },

  async excluir(id: number, usuarioLogadoId?: number) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("ID do usuário inválido.");
    }

    return prisma.$transaction(async (tx) => {
      const administradorId = await validarAdministrador(tx, usuarioLogadoId);

      if (id === administradorId) {
        throw new Error("Você não pode excluir o próprio usuário.");
      }

      const usuario = await tx.usuario.findUnique({
        where: { id },
        select: usuarioPublicoSelect,
      });

      if (!usuario) {
        throw new Error("Usuário não encontrado.");
      }

      await protegerUltimoAdministrador(tx, usuario, usuario.perfil, false);

      const movimentacao = await tx.movimentacao.findFirst({
        where: { usuarioId: id },
        select: { id: true },
      });

      const manutencao = await tx.manutencao.findFirst({
        where: {
          OR: [{ registradoPorId: id }, { tecnicoResponsavelId: id }],
        },
        select: { id: true },
      });

      if (movimentacao || manutencao) {
        throw new Error(
          "Este usuário possui movimentações ou manutenções vinculadas. Desative a conta para preservar o histórico.",
        );
      }

      return tx.usuario.delete({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });
    });
  },
};
