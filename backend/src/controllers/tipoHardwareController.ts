import { Request, Response } from "express";
import { tipoHardwareService } from "../services/tipoHardwareService";

class TipoHardwareController {
  async create(req: Request, res: Response) {
    const tipoHardware = await tipoHardwareService.create(req.body);

    return res.status(201).json(tipoHardware);
  }

  async findAll(req: Request, res: Response) {
    const tiposHardware = await tipoHardwareService.findAll();

    return res.json(tiposHardware);
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);

    const tipoHardware = await tipoHardwareService.findById(id);

    return res.json(tipoHardware);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);

    const tipoHardware = await tipoHardwareService.update(id, req.body);

    return res.json(tipoHardware);
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);

    await tipoHardwareService.delete(id);

    return res.status(204).send();
  }
}

export const tipoHardwareController = new TipoHardwareController();
