import { AppError } from "../errors/AppError";

import { hardwareRepository } from "../repositories/hardwareRepository";
import { campoHardwareRepository } from "../repositories/campoHardwareRepository";
import { hardwareValorRepository } from "../repositories/hardwareValorRepository";

import {
  atualizarHardwareValorSchema,
  criarHardwareValorSchema,
  AtualizarHardwareValorInput,
  CriarHardwareValorInput,
} from "../validators/hardwareValorValidator";

class HardwareValorService {
  async create(data: CriarHardwareValorInput) {
    const dadosValidados = criarHardwareValorSchema.parse(data);

    const hardware = await hardwareRepository.findById(
      dadosValidados.hardwareId,
    );

    if (!hardware) {
      throw new AppError("Hardware não encontrado.", 404);
    }

    const campo = await campoHardwareRepository.findById(
      dadosValidados.campoHardwareId,
    );

    if (!campo) {
      throw new AppError("Campo de hardware não encontrado.", 404);
    }

    const valorExistente = await hardwareValorRepository.findByHardwareECampo(
      dadosValidados.hardwareId,
      dadosValidados.campoHardwareId,
    );

    if (valorExistente) {
      throw new AppError(
        "Este hardware já possui um valor para este campo.",
        409,
      );
    }

    return hardwareValorRepository.create(dadosValidados);
  }

  async findAll() {
    return hardwareValorRepository.findAll();
  }

  async findById(id: number) {
    const valor = await hardwareValorRepository.findById(id);

    if (!valor) {
      throw new AppError("Valor não encontrado.", 404);
    }

    return valor;
  }

  async findByHardware(hardwareId: number) {
    await this.validarHardware(hardwareId);

    return hardwareValorRepository.findByHardware(hardwareId);
  }

  async update(id: number, data: AtualizarHardwareValorInput) {
    const dadosValidados = atualizarHardwareValorSchema.parse(data);

    await this.findById(id);

    return hardwareValorRepository.update(id, dadosValidados);
  }

  async delete(id: number) {
    await this.findById(id);

    return hardwareValorRepository.delete(id);
  }

  private async validarHardware(id: number) {
    const hardware = await hardwareRepository.findById(id);

    if (!hardware) {
      throw new AppError("Hardware não encontrado.", 404);
    }
  }
}

export const hardwareValorService = new HardwareValorService();
