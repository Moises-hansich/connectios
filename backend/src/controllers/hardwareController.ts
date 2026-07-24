import { Request, Response } from "express";
import { hardwareService } from "../services/hardwareService";

class HardwareController {
  async create(req: Request, res: Response) {
    const hardware = await hardwareService.create(req.body);

    return res.status(201).json(hardware);
  }

  async findAll(_req: Request, res: Response) {
    const hardwares = await hardwareService.findAll();

    return res.status(200).json(hardwares);
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);

    const hardware = await hardwareService.findById(id);

    return res.status(200).json(hardware);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);

    const hardware = await hardwareService.update(id, req.body);

    return res.status(200).json(hardware);
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);

    await hardwareService.delete(id);

    return res.status(204).send();
  }
}

export const hardwareController = new HardwareController();
