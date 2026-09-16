import type { Request, Response, NextFunction } from "express";
import { pecasService } from "../services/pecasService";
import { AppError } from "../errors/AppError";
export const pecasController = {
  opcoes: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await pecasService.opcoes()); } catch (error) { next(error); }
  },
  registrar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario) throw new AppError("Usuário não autenticado", 401);
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) throw new AppError("Dados inválidos", 400);
      res.status(201).json(await pecasService.registrar(req.body, req.usuario.usuarioId));
    } catch (error) { next(error); }
  },
};
