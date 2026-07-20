import { Request, Response } from "express";
import { DashboardService } from "../services/dashboardService";

const service = new DashboardService();

export class DashboardController {
  async index(req: Request, res: Response) {
    const dashboard = await service.obterDashboard();

    return res.json({
      success: true,
      data: dashboard,
    });
  }
}
