import { Request, Response } from "express";
import { campoHardwareService } from "../services/campoHardwareService";

class CampoHardwareController {
  async create(req: Request, res: Response) {
    const campoHardware = await campoHardwareService.create(req.body);

    return res.status(201).json(campoHardware);
  }

  async findAll(_req: Request, res: Response) {
    const camposHardware = await campoHardwareService.findAll();

    return res.status(200).json(camposHardware);
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);

    const campoHardware = await campoHardwareService.findById(id);

    return res.status(200).json(campoHardware);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);

    const campoHardware = await campoHardwareService.update(id, req.body);

    return res.status(200).json(campoHardware);
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);

    await campoHardwareService.delete(id);

    return res.status(204).send();
  }
}

export const campoHardwareController = new CampoHardwareController();
