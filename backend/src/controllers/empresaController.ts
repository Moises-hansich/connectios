import { Request, Response } from "express";
import { empresaService } from "../services/empresaService";

export class EmpresaController {
  async listar(req: Request, res: Response) {
    try {
      const empresas = await empresaService.listar();

      return res.status(200).json(empresas);
    } catch (error) {
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async listarAtivas(req: Request, res: Response) {
    try {
      const empresas = await empresaService.listarAtivas();

      return res.status(200).json(empresas);
    } catch (error) {
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const empresa = await empresaService.buscarPorId(id);

      return res.status(200).json(empresa);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const empresa = await empresaService.criar(req.body);

      return res.status(201).json(empresa);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const empresa = await empresaService.atualizar(id, req.body);

      return res.status(200).json(empresa);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      await empresaService.excluir(id);

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro interno.",
      });
    }
  }
}

export const empresaController = new EmpresaController();
