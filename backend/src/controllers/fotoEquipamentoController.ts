import type { NextFunction, Request, Response } from "express";

import { FotoEquipamentoService } from "../services/fotoEquipamentoService";

export class FotoEquipamentoController {
  private readonly service: FotoEquipamentoService;

  constructor() {
    this.service = new FotoEquipamentoService();
  }

  listarPorEquipamento = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const equipamentoId = Number(req.params.equipamentoId);
      const fotos = await this.service.listarPorEquipamento(equipamentoId);

      return res.status(200).json({
        success: true,
        data: fotos,
      });
    } catch (error) {
      next(error);
    }
  };

  adicionar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipamentoId = Number(req.params.equipamentoId);
      const arquivos = Array.isArray(req.files) ? req.files : [];

      const fotos = await this.service.adicionar(equipamentoId, arquivos);

      return res.status(201).json({
        success: true,
        message: "Fotos adicionadas com sucesso",
        data: fotos,
      });
    } catch (error) {
      next(error);
    }
  };

  definirPrincipal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const equipamentoId = Number(req.params.equipamentoId);
      const fotoId = Number(req.params.fotoId);

      const foto = await this.service.definirPrincipal(equipamentoId, fotoId);

      return res.status(200).json({
        success: true,
        message: "Foto principal definida com sucesso",
        data: foto,
      });
    } catch (error) {
      next(error);
    }
  };

  excluir = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipamentoId = Number(req.params.equipamentoId);
      const fotoId = Number(req.params.fotoId);

      await this.service.excluir(equipamentoId, fotoId);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const fotoEquipamentoController = new FotoEquipamentoController();
