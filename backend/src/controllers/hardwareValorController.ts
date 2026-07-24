import { Request, Response } from "express";
import { hardwareValorService } from "../services/hardwareValorService";

class HardwareValorController {
  async create(req: Request, res: Response) {
    const valor = await hardwareValorService.create(req.body);

    return res.status(201).json(valor);
  }

  async findAll(req: Request, res: Response) {
    const valores = await hardwareValorService.findAll();

    return res.json(valores);
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);

    const valor = await hardwareValorService.findById(id);

    return res.json(valor);
  }

  async findByHardware(req: Request, res: Response) {
    const hardwareId = Number(req.params.hardwareId);

    const valores = await hardwareValorService.findByHardware(hardwareId);

    return res.json(valores);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);

    const valor = await hardwareValorService.update(id, req.body);

    return res.json(valor);
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);

    await hardwareValorService.delete(id);

    return res.status(204).send();
  }
}

export const hardwareValorController = new HardwareValorController();
