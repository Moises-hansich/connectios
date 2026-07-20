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

  async atualizar(id: number, dados: AtualizarUsuarioInput) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID do usuário inválido.");
    }

    const usuarioAtual = await usuarioRepository.buscarPorId(id);

    if (!usuarioAtual) {
      throw new Error("Usuário não encontrado.");
    }

    const dadosAtualizados: AtualizarUsuarioData = {};

    if (dados.nome !== undefined) {
      const nome = dados.nome.trim();

      if (!nome) {
        throw new Error("O nome não pode ficar vazio.");
      }

      dadosAtualizados.nome = nome;
    }

    if (dados.email !== undefined) {
      const email = normalizarEmail(dados.email);

      if (!email) {
        throw new Error("O e-mail não pode ficar vazio.");
      }

      const usuarioComEmail = await usuarioRepository.buscarPorEmail(email);

      if (usuarioComEmail && usuarioComEmail.id !== id) {
        throw new Error("Já existe outro usuário com este e-mail.");
      }

      dadosAtualizados.email = email;
    }

    if (dados.perfil !== undefined) {
      const perfil = dados.perfil.toUpperCase();

      validarPerfil(perfil);

      dadosAtualizados.perfil = perfil;
    }

    if (dados.ativo !== undefined) {
      dadosAtualizados.ativo = dados.ativo;
    }

    if (dados.senha !== undefined) {
      if (dados.senha.length < 6) {
        throw new Error("A senha deve possuir pelo menos 6 caracteres.");
      }

      dadosAtualizados.senhaHash = await bcrypt.hash(dados.senha, 10);
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      throw new Error("Nenhum dado foi informado para atualização.");
    }

    return usuarioRepository.atualizar(id, dadosAtualizados);
  },

  async alterarStatus(id: number, ativo: boolean) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID do usuário inválido.");
    }

    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    if (typeof ativo !== "boolean") {
      throw new Error("O campo ativo deve ser verdadeiro ou falso.");
    }

    return usuarioRepository.alterarStatus(id, ativo);
  },

  async excluir(id: number, usuarioLogadoId?: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID do usuário inválido.");
    }

    if (usuarioLogadoId === id) {
      throw new Error("Você não pode excluir o próprio usuário.");
    }

    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    return usuarioRepository.excluir(id);
  },
};
