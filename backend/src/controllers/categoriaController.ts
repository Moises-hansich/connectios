import { Request, Response } from "express";
import { categoriaService } from "../services/categoriaService";

export class CategoriaController {
  async listar(req: Request, res: Response) {
    try {
      const categorias = await categoriaService.listar();

      return res.status(200).json(categorias);
    } catch (error) {
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async listarAtivas(req: Request, res: Response) {
    try {
      const categorias = await categoriaService.listarAtivas();

      return res.status(200).json(categorias);
    } catch (error) {
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const categoria = await categoriaService.buscarPorId(id);

      return res.status(200).json(categoria);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const categoria = await categoriaService.criar(req.body);

      return res.status(201).json(categoria);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const categoria = await categoriaService.atualizar(id, req.body);

      return res.status(200).json(categoria);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      await categoriaService.excluir(id);

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }
}

export const categoriaController = new CategoriaController();
