import { AppError } from "../errors/AppError";

import { equipamentoRepository } from "../repositories/equipamentoRepository";
import { hardwareRepository } from "../repositories/hardwareRepository";
import { tipoHardwareRepository } from "../repositories/tipoHardwareRepository";

import {
  atualizarHardwareSchema,
  criarHardwareSchema,
  type AtualizarHardwareInput,
  type CriarHardwareInput,
} from "../validators/hardwareValidator";

class HardwareService {
  async create(data: CriarHardwareInput) {
    const dadosValidados = criarHardwareSchema.parse(data);

    const equipamento = await equipamentoRepository.findById(
      dadosValidados.equipamentoId,
    );

    if (!equipamento) {
      throw new AppError("Equipamento não encontrado.", 404);
    }

    const tipoHardware = await tipoHardwareRepository.findById(
      dadosValidados.tipoHardwareId,
    );

    if (!tipoHardware) {
      throw new AppError("Tipo de hardware não encontrado.", 404);
    }

    return hardwareRepository.create(dadosValidados);
  }

  async findAll() {
    return hardwareRepository.findAll();
  }

  async findById(id: number) {
    const hardware = await hardwareRepository.findById(id);

    if (!hardware) {
      throw new AppError("Hardware não encontrado.", 404);
    }

    return hardware;
  }

  async update(id: number, data: AtualizarHardwareInput) {
    const dadosValidados = atualizarHardwareSchema.parse(data);

    await this.findById(id);

    return hardwareRepository.update(id, dadosValidados);
  }

  async delete(id: number) {
    await this.findById(id);

    return hardwareRepository.delete(id);
  }
}

export const hardwareService = new HardwareService();
