import { Request, Response } from "express";
import { EquipamentoService } from "../services/equipamentoService";

export class EquipamentoController {
  private service = new EquipamentoService();

  async listarTodos(req: Request, res: Response) {
    try {
      const equipamentos = await this.service.listarTodos();

      return res.status(200).json({
        success: true,
        data: equipamentos,
        total: equipamentos.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao listar equipamentos",
      });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const equipamento = await this.service.criar(req.body);

      return res.status(201).json({
        success: true,
        message: "Equipamento cadastrado com sucesso",
        data: equipamento,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro desconhecido";

      return res.status(400).json({
        success: false,
        message: mensagem,
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const equipamento = await this.service.buscarPorId(id);

      return res.status(200).json({
        success: true,
        data: equipamento,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro desconhecido";

      const status = mensagem === "Equipamento não encontrado" ? 404 : 500;

      return res.status(status).json({
        success: false,
        message: mensagem,
      });
    }
  }
  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const equipamento = await this.service.atualizar(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Equipamento atualizado com sucesso",
        data: equipamento,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro desconhecido";

      const status =
        mensagem === "Equipamento não encontrado"
          ? 404
          : mensagem.includes("deve")
            ? 400
            : 500;

      return res.status(status).json({
        success: false,
        message: mensagem,
      });
    }
  }
}
