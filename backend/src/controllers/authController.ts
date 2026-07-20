import type { NextFunction, Request, Response } from "express";

import { authService } from "../services/authService";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "E-mail e senha são obrigatórios",
        });
      }

      const resultado = await authService.login({
        email,
        senha,
      });

      return res.status(200).json({
        sucesso: true,
        data: resultado,
      });
    } catch (erro) {
      next(erro);
    }
  },

  async criarUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const { nome, email, senha, perfil } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome, e-mail e senha são obrigatórios",
        });
      }

      const usuario = await authService.criarUsuario({
        nome,
        email,
        senha,
        perfil,
      });

      return res.status(201).json({
        sucesso: true,
        data: usuario,
      });
    } catch (erro) {
      next(erro);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({
          sucesso: false,
          mensagem: "Usuário não autenticado",
        });
      }

      const usuario = await authService.buscarUsuarioLogado(usuarioId);

      return res.status(200).json({
        sucesso: true,
        data: usuario,
      });
    } catch (erro) {
      next(erro);
    }
  },
};
