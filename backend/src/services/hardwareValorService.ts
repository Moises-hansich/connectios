import { AppError } from "../errors/AppError";

import { campoHardwareRepository } from "../repositories/campoHardwareRepository";
import { hardwareRepository } from "../repositories/hardwareRepository";
import { hardwareValorRepository } from "../repositories/hardwareValorRepository";

import {
  AtualizarHardwareValorInput,
  CriarHardwareValorInput,
  atualizarHardwareValorSchema,
  criarHardwareValorSchema,
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

    if (campo.tipoHardwareId !== hardware.tipoHardwareId) {
      throw new AppError(
        "O campo informado não pertence ao tipo deste hardware.",
        400,
      );
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
      throw new AppError("Valor de hardware não encontrado.", 404);
    }

    return valor;
  }

  async findByHardware(hardwareId: number) {
    await this.validarHardware(hardwareId);

    return hardwareValorRepository.findByHardware(hardwareId);
  }

  async update(id: number, data: AtualizarHardwareValorInput) {
    const dadosValidados = atualizarHardwareValorSchema.parse(data);

    const valorAtual = await this.findById(id);

    const hardwareId = dadosValidados.hardwareId ?? valorAtual.hardwareId;

    const campoHardwareId =
      dadosValidados.campoHardwareId ?? valorAtual.campoHardwareId;

    const hardware = await hardwareRepository.findById(hardwareId);

    if (!hardware) {
      throw new AppError("Hardware não encontrado.", 404);
    }

    const campo = await campoHardwareRepository.findById(campoHardwareId);

    if (!campo) {
      throw new AppError("Campo de hardware não encontrado.", 404);
    }

    if (campo.tipoHardwareId !== hardware.tipoHardwareId) {
      throw new AppError(
        "O campo informado não pertence ao tipo deste hardware.",
        400,
      );
    }

    const valorExistente = await hardwareValorRepository.findByHardwareECampo(
      hardwareId,
      campoHardwareId,
    );

    if (valorExistente && valorExistente.id !== id) {
      throw new AppError(
        "Este hardware já possui um valor para este campo.",
        409,
      );
    }

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

    return hardware;
  }
}

export const hardwareValorService = new HardwareValorService();
