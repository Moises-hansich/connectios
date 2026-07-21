import {
  localizacaoRepository,
  type CreateLocalizacaoData,
  type UpdateLocalizacaoData,
} from "../repositories/localizacaoRepository";

export class LocalizacaoService {
  async listar() {
    return localizacaoRepository.findAll();
  }

  async buscarPorId(id: number) {
    const localizacao = await localizacaoRepository.findById(id);

    if (!localizacao) {
      throw new Error("Localização não encontrada.");
    }

    return localizacao;
  }

  async criar(data: CreateLocalizacaoData) {
    const nome = data.nome.trim();

    if (!nome) {
      throw new Error("O nome da localização é obrigatório.");
    }

    const existente = await localizacaoRepository.findByNome(nome);

    if (existente) {
      throw new Error("Já existe uma localização com esse nome.");
    }

    return localizacaoRepository.create({
      nome,
      descricao: data.descricao?.trim() || undefined,
    });
  }

  async atualizar(id: number, data: UpdateLocalizacaoData) {
    await this.buscarPorId(id);

    if (data.nome) {
      const existente = await localizacaoRepository.findByNome(
        data.nome.trim(),
      );

      if (existente && existente.id !== id) {
        throw new Error("Já existe uma localização com esse nome.");
      }
    }

    return localizacaoRepository.update(id, {
      nome: data.nome?.trim(),
      descricao: data.descricao?.trim() || undefined,
    });
  }

  async excluir(id: number) {
    await this.buscarPorId(id);

    return localizacaoRepository.delete(id);
  }
}

export const localizacaoService = new LocalizacaoService();
