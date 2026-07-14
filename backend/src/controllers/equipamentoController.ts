import { Request, Response } from "express";
import { EquipamentoService } from "../services/equipamentoService";
import { AppError } from "../errors/AppError";

export class EquipamentoController {
  private service = new EquipamentoService();

  async listarTodos(req: Request, res: Response) {
    const equipamentos = await this.service.listarTodos();

    return res.status(200).json({
      success: true,
      data: equipamentos,
      total: equipamentos.length,
    });
  }

  async criar(req: Request, res: Response) {
    const equipamento = await this.service.criar(req.body);

    return res.status(201).json({
      success: true,
      message: "Equipamento cadastrado com sucesso",
      data: equipamento,
    });
  }

  async buscarPorId(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID inválido", 400);
    }

    const equipamento = await this.service.buscarPorId(id);

    return res.status(200).json({
      success: true,
      data: equipamento,
    });
  }

  async atualizar(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID inválido", 400);
    }

    const equipamento = await this.service.atualizar(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Equipamento atualizado com sucesso",
      data: equipamento,
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
      message: "Equipamento deletado com sucesso",
    });
  }
}
