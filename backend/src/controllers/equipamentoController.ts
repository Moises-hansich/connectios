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
}
