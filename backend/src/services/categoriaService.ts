import {
  categoriaRepository,
  type CreateCategoriaData,
  type UpdateCategoriaData,
} from "../repositories/categoriaRepository";

export class CategoriaService {
  private validarId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID da categoria inválido.");
    }
  }

  async listar() {
    return categoriaRepository.findAll();
  }

  async listarAtivas() {
    return categoriaRepository.findAtivas();
  }

  async buscarPorId(id: number) {
    this.validarId(id);

    const categoria = await categoriaRepository.findById(id);

    if (!categoria) {
      throw new Error("Categoria não encontrada.");
    }

    return categoria;
  }

  async criar(data: CreateCategoriaData) {
    const nome = data.nome?.trim();

    if (!nome) {
      throw new Error("O nome da categoria é obrigatório.");
    }

    if (data.ativo !== undefined && typeof data.ativo !== "boolean") {
      throw new Error("O campo ativo deve ser verdadeiro ou falso.");
    }

    const existente = await categoriaRepository.findByNome(nome);

    if (existente) {
      throw new Error("Já existe uma categoria com esse nome.");
    }

    return categoriaRepository.create({
      nome,
      descricao: data.descricao?.trim() || null,
      ativo: data.ativo ?? true,
    });
  }

  async atualizar(id: number, data: UpdateCategoriaData) {
    await this.buscarPorId(id);

    const dadosAtualizados: UpdateCategoriaData = {};

    if (data.nome !== undefined) {
      const nome = data.nome.trim();

      if (!nome) {
        throw new Error("O nome da categoria é obrigatório.");
      }

      const existente = await categoriaRepository.findByNome(nome);

      if (existente && existente.id !== id) {
        throw new Error("Já existe uma categoria com esse nome.");
      }

      dadosAtualizados.nome = nome;
    }

    if (data.descricao !== undefined) {
      dadosAtualizados.descricao = data.descricao?.trim() || null;
    }

    if (data.ativo !== undefined) {
      if (typeof data.ativo !== "boolean") {
        throw new Error("O campo ativo deve ser verdadeiro ou falso.");
      }

      dadosAtualizados.ativo = data.ativo;
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      throw new Error("Nenhum dado foi informado para atualização.");
    }

    return categoriaRepository.update(id, dadosAtualizados);
  }

  async excluir(id: number) {
    await this.buscarPorId(id);

    const quantidadeEquipamentos =
      await categoriaRepository.countEquipamentos(id);

    if (quantidadeEquipamentos > 0) {
      throw new Error(
        `Esta categoria está vinculada a ${quantidadeEquipamentos} equipamento(s). Desative-a em vez de excluir.`,
      );
    }

    return categoriaRepository.delete(id);
  }
}

export const categoriaService = new CategoriaService();
