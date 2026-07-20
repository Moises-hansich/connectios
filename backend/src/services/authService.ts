import bcrypt from "bcryptjs";

import { usuarioRepository } from "../repositories/usuarioRepository";
import { gerarToken } from "../utils/jwt";

interface LoginInput {
  email: string;
  senha: string;
}

interface CriarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  perfil?: string;
}

export const authService = {
  async login({ email, senha }: LoginInput) {
    const usuario = await usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      throw new Error("E-mail ou senha inválidos");
    }

    if (!usuario.ativo) {
      throw new Error("Usuário inativo");
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaCorreta) {
      throw new Error("E-mail ou senha inválidos");
    }

    const token = gerarToken({
      usuarioId: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  },

  async criarUsuario({
    nome,
    email,
    senha,
    perfil = "USUARIO",
  }: CriarUsuarioInput) {
    const usuarioExistente = await usuarioRepository.buscarPorEmail(email);

    if (usuarioExistente) {
      throw new Error("Já existe um usuário com este e-mail");
    }

    if (senha.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    return usuarioRepository.criar({
      nome,
      email,
      senhaHash,
      perfil,
    });
  },

  async buscarUsuarioLogado(usuarioId: number) {
    const usuario = await usuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    return usuario;
  },
};
