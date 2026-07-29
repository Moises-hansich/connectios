import { AppError } from "../errors/AppError";

import {
  type CreateMovimentacaoData,
  type MovimentacaoFilters,
  MovimentacaoRepository,
} from "../repositories/movimentacaoRepository";

import { EquipamentoRepository } from "../repositories/equipamentoRepository";
import { LocalizacaoRepository } from "../repositories/localizacaoRepository";
import { ColaboradorRepository } from "../repositories/colaboradorRepository";

export const TIPOS_MOVIMENTACAO = [
  "ENTREGA",
  "TROCA",
  "DEVOLUCAO",
  "MUDANCA_LOCALIZACAO",
  "ENTRADA_MANUTENCAO",
  "RETORNO_MANUTENCAO",
  "BAIXA",
] as const;

export type TipoMovimentacao = (typeof TIPOS_MOVIMENTACAO)[number];

export class MovimentacaoService {
  private repository: MovimentacaoRepository;
  private equipamentoRepository: EquipamentoRepository;
  private localizacaoRepository: LocalizacaoRepository;
  private colaboradorRepository: ColaboradorRepository;

  constructor() {
    this.repository = new MovimentacaoRepository();
    this.equipamentoRepository = new EquipamentoRepository();
    this.localizacaoRepository = new LocalizacaoRepository();
    this.colaboradorRepository = new ColaboradorRepository();
  }

  async listarTodos() {
    return this.repository.findAll();
  }

  async buscarPorId(id: number) {
    this.validarId(id, "ID da movimentação");

    const movimentacao = await this.repository.findById(id);

    if (!movimentacao) {
      throw new AppError("Movimentação não encontrada", 404);
    }

    return movimentacao;
  }

  async buscarPorEquipamento(equipamentoId: number) {
    this.validarId(equipamentoId, "ID do equipamento");

    const equipamento =
      await this.equipamentoRepository.findById(equipamentoId);

    if (!equipamento) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    return this.repository.findByEquipamentoId(equipamentoId);
  }

  async registrar(data: CreateMovimentacaoData) {
    if (!data.tipo || data.tipo.trim() === "") {
      throw new AppError("Tipo da movimentação é obrigatório", 400);
    }

    const tipo = data.tipo.trim().toUpperCase() as TipoMovimentacao;

    if (!this.tipoPermitido(tipo)) {
      throw new AppError("Tipo de movimentação inválido", 400);
    }

    this.validarId(data.equipamentoId, "ID do equipamento");

    const equipamento = await this.equipamentoRepository.findById(
      data.equipamentoId,
    );

    if (!equipamento) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    await this.validarColaborador(
      data.responsavelAnteriorId,
      "Responsável anterior",
    );

    await this.validarColaborador(data.responsavelNovoId, "Novo responsável");

    await this.validarLocalizacao(
      data.localizacaoAnteriorId,
      "Localização anterior",
    );

    await this.validarLocalizacao(data.localizacaoNovaId, "Nova localização");

    this.validarIdOpcional(data.manutencaoId, "ID da manutenção");

    this.validarIdOpcional(data.usuarioId, "ID do usuário");

    if (data.dataHora !== undefined) {
      this.validarData(data.dataHora, "Data e hora da movimentação");
    }

    this.validarRegrasDoTipo(tipo, data);

    const movimentacaoLimpa: CreateMovimentacaoData = {
      tipo,
      equipamentoId: data.equipamentoId,

      responsavelAnteriorId: data.responsavelAnteriorId ?? null,

      responsavelNovoId: data.responsavelNovoId ?? null,

      localizacaoAnteriorId: data.localizacaoAnteriorId ?? null,

      localizacaoNovaId: data.localizacaoNovaId ?? null,

      manutencaoId: data.manutencaoId ?? null,

      usuarioId: data.usuarioId ?? null,

      statusAnterior: data.statusAnterior?.trim() || null,

      statusNovo: data.statusNovo?.trim() || null,

      observacoes: data.observacoes?.trim() || null,

      dataHora: data.dataHora ?? new Date(),
    };

    return this.repository.create(movimentacaoLimpa);
  }

  async buscarComFiltros(filters: MovimentacaoFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    if (!Number.isInteger(page) || page <= 0) {
      throw new AppError("Página inválida", 400);
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      throw new AppError("Limite deve ser um número entre 1 e 100", 400);
    }

    if (filters.equipamentoId !== undefined) {
      this.validarId(filters.equipamentoId, "ID do equipamento");
    }

    if (filters.usuarioId !== undefined) {
      this.validarId(filters.usuarioId, "ID do usuário");
    }

    let tipo: TipoMovimentacao | undefined;

    if (filters.tipo?.trim()) {
      tipo = filters.tipo.trim().toUpperCase() as TipoMovimentacao;

      if (!this.tipoPermitido(tipo)) {
        throw new AppError("Tipo de movimentação inválido", 400);
      }
    }

    if (filters.dataInicio !== undefined) {
      this.validarData(filters.dataInicio, "Data inicial");
    }

    if (filters.dataFim !== undefined) {
      this.validarData(filters.dataFim, "Data final");
    }

    if (
      filters.dataInicio &&
      filters.dataFim &&
      filters.dataInicio > filters.dataFim
    ) {
      throw new AppError(
        "A data inicial não pode ser posterior à data final",
        400,
      );
    }

    return this.repository.findWithFilters({
      ...filters,
      tipo,
      page,
      limit,
    });
  }

  private tipoPermitido(tipo: string): tipo is TipoMovimentacao {
    return TIPOS_MOVIMENTACAO.some((tipoPermitido) => tipoPermitido === tipo);
  }

  private validarId(id: number, campo: string) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(`${campo} inválido`, 400);
    }
  }

  private validarIdOpcional(id: number | null | undefined, campo: string) {
    if (id !== undefined && id !== null) {
      this.validarId(id, campo);
    }
  }

  private validarData(data: Date, campo: string) {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      throw new AppError(`${campo} inválida`, 400);
    }
  }

  private async validarColaborador(
    colaboradorId: number | null | undefined,
    campo: string,
  ) {
    if (colaboradorId === undefined || colaboradorId === null) {
      return;
    }

    this.validarId(colaboradorId, campo);

    const colaborador =
      await this.colaboradorRepository.findById(colaboradorId);

    if (!colaborador) {
      throw new AppError(`${campo} não encontrado`, 404);
    }
  }

  private async validarLocalizacao(
    localizacaoId: number | null | undefined,
    campo: string,
  ) {
    if (localizacaoId === undefined || localizacaoId === null) {
      return;
    }

    this.validarId(localizacaoId, campo);

    const localizacao =
      await this.localizacaoRepository.findById(localizacaoId);

    if (!localizacao) {
      throw new AppError(`${campo} não encontrada`, 404);
    }
  }

  private validarRegrasDoTipo(
    tipo: TipoMovimentacao,
    data: CreateMovimentacaoData,
  ) {
    if (tipo === "ENTREGA" && !data.responsavelNovoId) {
      throw new AppError("A entrega deve possuir um novo responsável", 400);
    }

    if (tipo === "TROCA") {
      if (!data.responsavelAnteriorId || !data.responsavelNovoId) {
        throw new AppError(
          "A troca deve possuir o responsável anterior e o novo responsável",
          400,
        );
      }

      if (data.responsavelAnteriorId === data.responsavelNovoId) {
        throw new AppError(
          "O novo responsável deve ser diferente do responsável anterior",
          400,
        );
      }
    }

    if (tipo === "DEVOLUCAO" && !data.responsavelAnteriorId) {
      throw new AppError(
        "A devolução deve informar o responsável anterior",
        400,
      );
    }

    if (tipo === "MUDANCA_LOCALIZACAO") {
      if (!data.localizacaoNovaId) {
        throw new AppError("A mudança deve possuir uma nova localização", 400);
      }

      if (
        data.localizacaoAnteriorId !== undefined &&
        data.localizacaoAnteriorId !== null &&
        data.localizacaoAnteriorId === data.localizacaoNovaId
      ) {
        throw new AppError(
          "A nova localização deve ser diferente da localização anterior",
          400,
        );
      }
    }

    if (
      (tipo === "ENTRADA_MANUTENCAO" || tipo === "RETORNO_MANUTENCAO") &&
      !data.manutencaoId
    ) {
      throw new AppError(
        "A movimentação de manutenção deve estar vinculada a uma manutenção",
        400,
      );
    }
  }
}
