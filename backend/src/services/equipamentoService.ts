import { AppError } from "../errors/AppError";

import {
  type CreateEquipamentoData,
  type EquipamentoFilters,
  EquipamentoRepository,
} from "../repositories/equipamentoRepository";

import { LocalizacaoRepository } from "../repositories/localizacaoRepository";
import { ColaboradorRepository } from "../repositories/colaboradorRepository";

export class EquipamentoService {
  private repository: EquipamentoRepository;
  private localizacaoRepository: LocalizacaoRepository;
  private colaboradorRepository: ColaboradorRepository;

  constructor() {
    this.repository = new EquipamentoRepository();
    this.localizacaoRepository = new LocalizacaoRepository();
    this.colaboradorRepository = new ColaboradorRepository();
  }

  async listarTodos() {
    return this.repository.findAll();
  }

  async criar(data: CreateEquipamentoData) {
    if (!data.nome || data.nome.trim().length < 3) {
      throw new AppError("Nome deve ter pelo menos 3 caracteres", 400);
    }

    if (!data.categoria || data.categoria.trim() === "") {
      throw new AppError("Categoria é obrigatória", 400);
    }

    if (!data.status || data.status.trim() === "") {
      throw new AppError("Status é obrigatório", 400);
    }

    if (data.numeroSerie?.trim()) {
      const equipamentoComMesmoSerial = await this.repository.findByNumeroSerie(
        data.numeroSerie.trim(),
      );

      if (equipamentoComMesmoSerial) {
        throw new AppError("Número de série já cadastrado", 409);
      }
    }

    if (data.patrimonio?.trim()) {
      const equipamentoComMesmoPatrimonio =
        await this.repository.findByPatrimonio(data.patrimonio.trim());

      if (equipamentoComMesmoPatrimonio) {
        throw new AppError("Patrimônio já cadastrado", 409);
      }
    }

    if (data.localizacaoId !== undefined && data.localizacaoId !== null) {
      if (!Number.isInteger(data.localizacaoId) || data.localizacaoId <= 0) {
        throw new AppError("Localização inválida", 400);
      }

      const localizacao = await this.localizacaoRepository.findById(
        data.localizacaoId,
      );

      if (!localizacao) {
        throw new AppError("Localização não encontrada", 404);
      }
    }

    if (data.responsavelId !== undefined && data.responsavelId !== null) {
      if (!Number.isInteger(data.responsavelId) || data.responsavelId <= 0) {
        throw new AppError("Responsável inválido", 400);
      }

      const colaborador = await this.colaboradorRepository.findById(
        data.responsavelId,
      );

      if (!colaborador) {
        throw new AppError("Colaborador responsável não encontrado", 404);
      }
    }

    const equipamentoLimpo: CreateEquipamentoData = {
      nome: data.nome.trim(),
      categoria: data.categoria.trim(),
      fabricante: data.fabricante?.trim() || undefined,
      modelo: data.modelo?.trim() || undefined,
      numeroSerie: data.numeroSerie?.trim() || undefined,
      patrimonio: data.patrimonio?.trim() || undefined,
      status: data.status.trim(),
      localizacaoId: data.localizacaoId ?? null,
      responsavelId: data.responsavelId ?? null,
      observacoes: data.observacoes?.trim() || undefined,
    };

    return this.repository.create(equipamentoLimpo);
  }

  async buscarPorId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID do equipamento inválido", 400);
    }

    const equipamento = await this.repository.findById(id);

    if (!equipamento) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    return equipamento;
  }

  async atualizar(id: number, data: Partial<CreateEquipamentoData>) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID do equipamento inválido", 400);
    }

    const equipamentoExistente = await this.repository.findById(id);

    if (!equipamentoExistente) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    if (data.nome !== undefined && data.nome.trim().length < 3) {
      throw new AppError("Nome deve ter pelo menos 3 caracteres", 400);
    }

    if (data.categoria !== undefined && data.categoria.trim() === "") {
      throw new AppError("Categoria não pode ficar vazia", 400);
    }

    if (data.status !== undefined && data.status.trim() === "") {
      throw new AppError("Status não pode ficar vazio", 400);
    }

    if (
      data.numeroSerie !== undefined &&
      data.numeroSerie.trim() !== "" &&
      data.numeroSerie.trim() !== equipamentoExistente.numeroSerie
    ) {
      const equipamentoComMesmoSerial = await this.repository.findByNumeroSerie(
        data.numeroSerie.trim(),
      );

      if (equipamentoComMesmoSerial && equipamentoComMesmoSerial.id !== id) {
        throw new AppError("Número de série já cadastrado", 409);
      }
    }

    if (
      data.patrimonio !== undefined &&
      data.patrimonio.trim() !== "" &&
      data.patrimonio.trim() !== equipamentoExistente.patrimonio
    ) {
      const equipamentoComMesmoPatrimonio =
        await this.repository.findByPatrimonio(data.patrimonio.trim());

      if (
        equipamentoComMesmoPatrimonio &&
        equipamentoComMesmoPatrimonio.id !== id
      ) {
        throw new AppError("Patrimônio já cadastrado", 409);
      }
    }

    if (data.localizacaoId !== undefined && data.localizacaoId !== null) {
      if (!Number.isInteger(data.localizacaoId) || data.localizacaoId <= 0) {
        throw new AppError("Localização inválida", 400);
      }

      const localizacao = await this.localizacaoRepository.findById(
        data.localizacaoId,
      );

      if (!localizacao) {
        throw new AppError("Localização não encontrada", 404);
      }
    }

    if (data.responsavelId !== undefined && data.responsavelId !== null) {
      if (!Number.isInteger(data.responsavelId) || data.responsavelId <= 0) {
        throw new AppError("Responsável inválido", 400);
      }

      const colaborador = await this.colaboradorRepository.findById(
        data.responsavelId,
      );

      if (!colaborador) {
        throw new AppError("Colaborador responsável não encontrado", 404);
      }
    }

    const equipamentoLimpo: Partial<CreateEquipamentoData> = {};

    if (data.nome !== undefined) {
      equipamentoLimpo.nome = data.nome.trim();
    }

    if (data.categoria !== undefined) {
      equipamentoLimpo.categoria = data.categoria.trim();
    }

    if (data.fabricante !== undefined) {
      equipamentoLimpo.fabricante = data.fabricante.trim() || undefined;
    }

    if (data.modelo !== undefined) {
      equipamentoLimpo.modelo = data.modelo.trim() || undefined;
    }

    if (data.numeroSerie !== undefined) {
      equipamentoLimpo.numeroSerie = data.numeroSerie.trim() || undefined;
    }

    if (data.patrimonio !== undefined) {
      equipamentoLimpo.patrimonio = data.patrimonio.trim() || undefined;
    }

    if (data.status !== undefined) {
      equipamentoLimpo.status = data.status.trim();
    }

    if (data.localizacaoId !== undefined) {
      equipamentoLimpo.localizacaoId = data.localizacaoId;
    }

    if (data.responsavelId !== undefined) {
      equipamentoLimpo.responsavelId = data.responsavelId;
    }

    if (data.observacoes !== undefined) {
      equipamentoLimpo.observacoes = data.observacoes.trim() || undefined;
    }

    return this.repository.update(id, equipamentoLimpo);
  }

  async deletar(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID do equipamento inválido", 400);
    }

    const equipamentoExistente = await this.repository.findById(id);

    if (!equipamentoExistente) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    return this.repository.delete(id);
  }

  async buscarComFiltros(filters: EquipamentoFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    if (!Number.isInteger(page) || page <= 0) {
      throw new AppError("Página inválida", 400);
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      throw new AppError("Limite deve ser um número entre 1 e 100", 400);
    }

    if (
      filters.localizacaoId !== undefined &&
      (!Number.isInteger(filters.localizacaoId) || filters.localizacaoId <= 0)
    ) {
      throw new AppError("Localização inválida", 400);
    }

    return this.repository.findWithFilters({
      ...filters,
      search: filters.search?.trim() || undefined,
      categoria: filters.categoria?.trim() || undefined,
      status: filters.status?.trim() || undefined,
      page,
      limit,
    });
  }
}
