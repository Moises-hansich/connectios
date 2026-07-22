import { Request, Response } from "express";
import { ColaboradorService } from "../services/colaboradorService";
import { AppError } from "../errors/AppError";

export class ColaboradorController {
  private service = new ColaboradorService();

  async listarTodos(req: Request, res: Response) {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const ativo =
      typeof req.query.ativo === "string"
        ? req.query.ativo === "true"
        : undefined;

    const localizacaoId =
      typeof req.query.localizacaoId === "string"
        ? Number(req.query.localizacaoId)
        : undefined;

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;

    const resultado = await this.service.buscarComFiltros({
      search,
      ativo,
      localizacaoId,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: resultado.colaboradores,
      pagination: {
        total: resultado.total,
        page: resultado.page,
        limit: resultado.limit,
        totalPages: resultado.totalPages,
      },
    });
  }

  async criar(req: Request, res: Response) {
    const colaborador = await this.service.criar(req.body);

    return res.status(201).json({
      success: true,
      message: "Colaborador cadastrado com sucesso",
      data: colaborador,
    });
  }

  async buscarPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID inválido", 400);
    }

    const colaborador = await this.service.buscarPorId(id);

    return res.status(200).json({
      success: true,
      data: colaborador,
    });
  }

  async atualizar(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID inválido", 400);
    }

    const colaborador = await this.service.atualizar(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Colaborador atualizado com sucesso",
      data: colaborador,
    });
  }

  async deletar(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID inválido", 400);
    }

    await this.service.deletar(id);

    return res.status(200).json({
      success: true,
      message: "Colaborador deletado com sucesso",
    });
  }
}
