import { AppError } from "../errors/AppError";
import { tipoHardwareRepository } from "../repositories/tipoHardwareRepository";
import {
  atualizarTipoHardwareSchema,
  criarTipoHardwareSchema,
  AtualizarTipoHardwareInput,
  CriarTipoHardwareInput,
} from "../validators/tipoHardwareValidator";

class TipoHardwareService {
  async create(data: CriarTipoHardwareInput) {
    const dadosValidados = criarTipoHardwareSchema.parse(data);

    const tipoExistente = await tipoHardwareRepository.findByNome(
      dadosValidados.nome,
    );

    if (tipoExistente) {
      throw new AppError("Já existe um tipo de hardware com esse nome.", 409);
    }

    return tipoHardwareRepository.create(dadosValidados);
  }

  async findAll() {
    return tipoHardwareRepository.findAll();
  }

  async findById(id: number) {
    const tipoHardware = await tipoHardwareRepository.findById(id);

    if (!tipoHardware) {
      throw new AppError("Tipo de hardware não encontrado.", 404);
    }

    return tipoHardware;
  }

  async update(id: number, data: AtualizarTipoHardwareInput) {
    const dadosValidados = atualizarTipoHardwareSchema.parse(data);

    await this.findById(id);

    if (dadosValidados.nome) {
      const tipoExistente = await tipoHardwareRepository.findByNome(
        dadosValidados.nome,
      );

      if (tipoExistente && tipoExistente.id !== id) {
        throw new AppError("Já existe um tipo de hardware com esse nome.", 409);
      }
    }

    return tipoHardwareRepository.update(id, dadosValidados);
  }

  async delete(id: number) {
    await this.findById(id);

    return tipoHardwareRepository.delete(id);
  }
}

export const tipoHardwareService = new TipoHardwareService();
