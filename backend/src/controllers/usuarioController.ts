import type { Request, Response } from "express";

import { usuarioService } from "../services/usuarioService";

function converterId(valor: string | string[]): number {
  const valorUnico = Array.isArray(valor) ? valor[0] : valor;
  const id = Number(valorUnico);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID inválido");
  }

  return id;
}

export const usuarioController = {
  async listar(_req: Request, res: Response) {
    try {
      const usuarios = await usuarioService.listar();

      return res.status(200).json({
        sucesso: true,
        data: usuarios,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível listar os usuários.";

      return res.status(400).json({
        sucesso: false,
        mensagem,
      });
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      const usuario = await usuarioService.buscarPorId(id);

      return res.status(200).json({
        sucesso: true,
        data: usuario,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível buscar o usuário.";

      const status = mensagem === "Usuário não encontrado." ? 404 : 400;

      return res.status(status).json({
        sucesso: false,
        mensagem,
      });
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const usuario = await usuarioService.criar({
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        perfil: req.body.perfil,
        ativo: req.body.ativo,
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Usuário criado com sucesso.",
        data: usuario,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível criar o usuário.";

      const status = mensagem.includes("Já existe") ? 409 : 400;

      return res.status(status).json({
        sucesso: false,
        mensagem,
      });
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      const usuario = await usuarioService.atualizar(id, {
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        perfil: req.body.perfil,
        ativo: req.body.ativo,
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Usuário atualizado com sucesso.",
        data: usuario,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o usuário.";

      let status = 400;

      if (mensagem === "Usuário não encontrado.") {
        status = 404;
      }

      if (mensagem.includes("Já existe")) {
        status = 409;
      }

      return res.status(status).json({
        sucesso: false,
        mensagem,
      });
    }
  },

  async alterarStatus(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      const usuario = await usuarioService.alterarStatus(id, req.body.ativo);

      return res.status(200).json({
        sucesso: true,
        mensagem: usuario.ativo
          ? "Usuário ativado com sucesso."
          : "Usuário inativado com sucesso.",
        data: usuario,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status do usuário.";

      const status = mensagem === "Usuário não encontrado." ? 404 : 400;

      return res.status(status).json({
        sucesso: false,
        mensagem,
      });
    }
  },

  async excluir(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      const usuarioLogadoId = req.usuario?.usuarioId;

      const usuario = await usuarioService.excluir(id, usuarioLogadoId);

      return res.status(200).json({
        sucesso: true,
        mensagem: "Usuário excluído com sucesso.",
        data: usuario,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o usuário.";

      const status = mensagem === "Usuário não encontrado." ? 404 : 400;

      return res.status(status).json({
        sucesso: false,
        mensagem,
      });
    }
  },
};
