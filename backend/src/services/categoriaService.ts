import {
  categoriaRepository,
  type CreateCategoriaData,
  type UpdateCategoriaData,
} from "../repositories/categoriaRepository";

import { grupoValido, type GrupoCategoria } from "../utils/grupoEquipamento";

export class CategoriaService {
  private validarId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID da categoria inválido.");
    }
  }

  private validarGrupo(valor: unknown): GrupoCategoria {
    if (!grupoValido(valor)) {
      throw new Error(
        "Selecione um grupo válido: Computadores, Periféricos, Peças ou Outros.",
      );
    }

    return valor;
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
    const nome = typeof data.nome === "string" ? data.nome.trim() : "";

    if (!nome) {
      throw new Error("O nome da categoria é obrigatório.");
    }

    const grupo =
      data.grupo === undefined ? "OUTROS" : this.validarGrupo(data.grupo);

    if (
      data.descricao !== undefined &&
      data.descricao !== null &&
      typeof data.descricao !== "string"
    ) {
      throw new Error("A descrição deve ser um texto.");
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
      grupo,
      descricao: data.descricao?.trim() || null,
      ativo: data.ativo ?? true,
    });
  }

  async atualizar(id: number, data: UpdateCategoriaData) {
    await this.buscarPorId(id);

    const dadosAtualizados: UpdateCategoriaData = {};

    if (data.nome !== undefined) {
      if (typeof data.nome !== "string" || !data.nome.trim()) {
        throw new Error("O nome da categoria é obrigatório.");
      }

      const nome = data.nome.trim();
      const existente = await categoriaRepository.findByNome(nome);

      if (existente && existente.id !== id) {
        throw new Error("Já existe uma categoria com esse nome.");
      }

      dadosAtualizados.nome = nome;
    }

    if (data.grupo !== undefined) {
      dadosAtualizados.grupo = this.validarGrupo(data.grupo);
    }

    if (data.descricao !== undefined) {
      if (data.descricao !== null && typeof data.descricao !== "string") {
        throw new Error("A descrição deve ser um texto.");
      }

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
