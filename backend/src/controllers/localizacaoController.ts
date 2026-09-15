import { Request, Response } from "express";
import { localizacaoService } from "../services/localizacaoService";

export class LocalizacaoController {
  async listar(req: Request, res: Response) {
    try {
      const localizacoes = await localizacaoService.listar();

      return res.status(200).json(localizacoes);
    } catch (error) {
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const localizacao = await localizacaoService.buscarPorId(id);

      return res.status(200).json(localizacao);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const localizacao = await localizacaoService.criar(req.body);

      return res.status(201).json(localizacao);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const localizacao = await localizacaoService.atualizar(id, req.body);

      return res.status(200).json(localizacao);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      await localizacaoService.excluir(id);

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }
  async listarColaboradores(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "ID da localização inválido.",
        });
      }

      const resultado = await localizacaoService.listarColaboradores(id);

      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(404).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar colaboradores.",
      });
    }
  }
}

export const localizacaoController = new LocalizacaoController();
