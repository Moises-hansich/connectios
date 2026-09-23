import type { Request, Response } from "express";

import { AppError } from "../errors/AppError";
import { empresaService } from "../services/empresaService";

function converterId(valor: unknown): number {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new AppError("ID da empresa inválido.", 400);
  }

  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError("ID da empresa inválido.", 400);
  }

  return id;
}

function validarCorpo(valor: unknown): void {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
    throw new AppError("Envie um objeto com os dados da empresa.", 400);
  }
}

function responderErro(res: Response, error: unknown, statusPadrao: number) {
  let status = statusPadrao;

  if (typeof error === "object" && error !== null) {
    const codigo =
      "statusCode" in error
        ? error.statusCode
        : "status" in error
          ? error.status
          : undefined;

    if (
      typeof codigo === "number" &&
      Number.isInteger(codigo) &&
      codigo >= 400 &&
      codigo <= 599
    ) {
      status = codigo;
    }
  }

  return res.status(status).json({
    message: error instanceof Error ? error.message : "Erro interno.",
  });
}

export class EmpresaController {
  async listar(_req: Request, res: Response) {
    try {
      const empresas = await empresaService.listar();

      return res.status(200).json(empresas);
    } catch (error) {
      return responderErro(res, error, 500);
    }
  }

  async listarAtivas(_req: Request, res: Response) {
    try {
      const empresas = await empresaService.listarAtivas();

      return res.status(200).json(empresas);
    } catch (error) {
      return responderErro(res, error, 500);
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      const empresa = await empresaService.buscarPorId(id);

      return res.status(200).json(empresa);
    } catch (error) {
      return responderErro(res, error, 404);
    }
  }

  async criar(req: Request, res: Response) {
    try {
      validarCorpo(req.body);

      const empresa = await empresaService.criar(req.body);

      return res.status(201).json(empresa);
    } catch (error) {
      return responderErro(res, error, 400);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      validarCorpo(req.body);

      const empresa = await empresaService.atualizar(id, req.body);

      return res.status(200).json(empresa);
    } catch (error) {
      return responderErro(res, error, 400);
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      await empresaService.excluir(id);

      return res.status(204).send();
    } catch (error) {
      return responderErro(res, error, 400);
    }
  }
}

export const empresaController = new EmpresaController();
