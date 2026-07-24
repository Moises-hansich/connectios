import { AppError } from "../errors/AppError";
import { campoHardwareRepository } from "../repositories/campoHardwareRepository";
import { tipoHardwareRepository } from "../repositories/tipoHardwareRepository";
import {
  criarCampoHardwareSchema,
  atualizarCampoHardwareSchema,
  CriarCampoHardwareInput,
  AtualizarCampoHardwareInput,
} from "../validators/campoHardwareValidator";

class CampoHardwareService {
  async create(data: CriarCampoHardwareInput) {
    const dadosValidados = criarCampoHardwareSchema.parse(data);

    const tipoHardware = await tipoHardwareRepository.findById(
      dadosValidados.tipoHardwareId,
    );

    if (!tipoHardware) {
      throw new AppError("Tipo de hardware não encontrado.", 404);
    }

    const campoExistente = await campoHardwareRepository.findByNome(
      dadosValidados.nome,
      dadosValidados.tipoHardwareId,
    );

    if (campoExistente) {
      throw new AppError(
        "Já existe um campo com esse nome para este tipo de hardware.",
        409,
      );
    }

    return campoHardwareRepository.create(dadosValidados);
  }

  async findAll() {
    return campoHardwareRepository.findAll();
  }

  async findById(id: number) {
    const campoHardware = await campoHardwareRepository.findById(id);

    if (!campoHardware) {
      throw new AppError("Campo de hardware não encontrado.", 404);
    }

    return campoHardware;
  }

  async update(id: number, data: AtualizarCampoHardwareInput) {
    const dadosValidados = atualizarCampoHardwareSchema.parse(data);

    const campoAtual = await this.findById(id);

    if (dadosValidados.nome) {
      const campoExistente = await campoHardwareRepository.findByNome(
        dadosValidados.nome,
        campoAtual.tipoHardwareId,
      );

      if (campoExistente && campoExistente.id !== id) {
        throw new AppError(
          "Já existe um campo com esse nome para este tipo de hardware.",
          409,
        );
      }
    }

    return campoHardwareRepository.update(id, dadosValidados);
  }

  async delete(id: number) {
    await this.findById(id);

    return campoHardwareRepository.delete(id);
  }
}

export const campoHardwareService = new CampoHardwareService();
