import { AppError } from "../errors/AppError";
import { prisma } from "../prisma";

import {
  type ManutencaoFilters,
  type UpdateManutencaoData,
  ManutencaoRepository,
} from "../repositories/manutencaoRepository";

import { MovimentacaoRepository } from "../repositories/movimentacaoRepository";
import { EquipamentoRepository } from "../repositories/equipamentoRepository";

export const STATUS_MANUTENCAO = ["EM_ANDAMENTO", "FINALIZADA"] as const;

export type StatusManutencao = (typeof STATUS_MANUTENCAO)[number];

export interface AbrirManutencaoData {
  equipamentoId: number;
  problemaInformado: string;
  localManutencao?: string | null;
  empresaResponsavel?: string | null;
  previsaoRetorno?: Date | null;
  custo?: number | null;
  observacoes?: string | null;
  registradoPorId?: number | null;
  dataSaida?: Date;
}

export interface FinalizarManutencaoData {
  diagnostico?: string | null;
  solucao: string;
  custo?: number | null;
  observacoes?: string | null;
  usuarioId?: number | null;
  dataRetorno?: Date;
}

export class ManutencaoService {
  private manutencaoRepository: ManutencaoRepository;
  private movimentacaoRepository: MovimentacaoRepository;
  private equipamentoRepository: EquipamentoRepository;

  constructor() {
    this.manutencaoRepository = new ManutencaoRepository();

    this.movimentacaoRepository = new MovimentacaoRepository();

    this.equipamentoRepository = new EquipamentoRepository();
  }

  async listarTodos() {
    return this.manutencaoRepository.findAll();
  }

  async buscarPorId(id: number) {
    this.validarId(id, "ID da manutenção");

    const manutencao = await this.manutencaoRepository.findById(id);

    if (!manutencao) {
      throw new AppError("Manutenção não encontrada", 404);
    }

    return manutencao;
  }

  async buscarPorEquipamento(equipamentoId: number) {
    this.validarId(equipamentoId, "ID do equipamento");

    const equipamento =
      await this.equipamentoRepository.findById(equipamentoId);

    if (!equipamento) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    return this.manutencaoRepository.findByEquipamentoId(equipamentoId);
  }

  async abrir(data: AbrirManutencaoData) {
    this.validarId(data.equipamentoId, "ID do equipamento");

    if (!data.problemaInformado || data.problemaInformado.trim().length < 5) {
      throw new AppError(
        "O problema informado deve possuir pelo menos 5 caracteres",
        400,
      );
    }

    const dataSaida = data.dataSaida ?? new Date();

    this.validarData(dataSaida, "Data de saída");

    if (data.previsaoRetorno) {
      this.validarData(data.previsaoRetorno, "Previsão de retorno");

      if (data.previsaoRetorno < dataSaida) {
        throw new AppError(
          "A previsão de retorno não pode ser anterior à data de saída",
          400,
        );
      }
    }

    this.validarCusto(data.custo);

    await this.validarUsuario(data.registradoPorId);

    return prisma.$transaction(async (tx) => {
      const equipamento = await tx.equipamento.findUnique({
        where: {
          id: data.equipamentoId,
        },
      });

      if (!equipamento) {
        throw new AppError("Equipamento não encontrado", 404);
      }

      const manutencaoEmAndamento =
        await this.manutencaoRepository.findEmAndamentoByEquipamentoId(
          data.equipamentoId,
          tx,
        );

      if (manutencaoEmAndamento) {
        throw new AppError(
          "Este equipamento já possui uma manutenção em andamento",
          409,
        );
      }

      if (equipamento.status.trim().toUpperCase() === "Em manutenção") {
        throw new AppError(
          "O equipamento já está marcado como em manutenção",
          409,
        );
      }

      const manutencao = await this.manutencaoRepository.create(
        {
          equipamentoId: equipamento.id,

          problemaInformado: data.problemaInformado.trim(),

          localManutencao: data.localManutencao?.trim() || null,

          empresaResponsavel: data.empresaResponsavel?.trim() || null,

          dataSaida,

          previsaoRetorno: data.previsaoRetorno ?? null,

          dataRetorno: null,

          custo: data.custo ?? null,

          status: "EM_ANDAMENTO",

          observacoes: data.observacoes?.trim() || null,

          responsavelAnteriorId: equipamento.responsavelId,

          localizacaoAnteriorId: equipamento.localizacaoId,

          statusAnterior: equipamento.status,

          registradoPorId: data.registradoPorId ?? null,
        },
        tx,
      );

      await tx.equipamento.update({
        where: {
          id: equipamento.id,
        },

        data: {
          status: "Em manutenção",
          responsavelId: null,
          localizacaoId: null,
        },
      });

      await this.movimentacaoRepository.create(
        {
          tipo: "ENTRADA_MANUTENCAO",

          equipamentoId: equipamento.id,

          responsavelAnteriorId: equipamento.responsavelId,

          responsavelNovoId: null,

          localizacaoAnteriorId: equipamento.localizacaoId,

          localizacaoNovaId: null,

          manutencaoId: manutencao.id,

          usuarioId: data.registradoPorId ?? null,

          statusAnterior: equipamento.status,

          statusNovo: "Em manutenção",

          observacoes: `Entrada em manutenção: ${data.problemaInformado.trim()}`,

          dataHora: dataSaida,
        },
        tx,
      );

      return this.manutencaoRepository.findById(manutencao.id, tx);
    });
  }

  async finalizar(id: number, data: FinalizarManutencaoData) {
    this.validarId(id, "ID da manutenção");

    if (!data.solucao || data.solucao.trim().length < 3) {
      throw new AppError("A solução deve possuir pelo menos 3 caracteres", 400);
    }

    if (
      data.diagnostico !== undefined &&
      data.diagnostico !== null &&
      data.diagnostico.trim() !== "" &&
      data.diagnostico.trim().length < 3
    ) {
      throw new AppError(
        "O diagnóstico deve possuir pelo menos 3 caracteres",
        400,
      );
    }

    const dataRetorno = data.dataRetorno ?? new Date();

    this.validarData(dataRetorno, "Data de retorno");

    this.validarCusto(data.custo);

    await this.validarUsuario(data.usuarioId);

    return prisma.$transaction(async (tx) => {
      const manutencao = await this.manutencaoRepository.findById(id, tx);

      if (!manutencao) {
        throw new AppError("Manutenção não encontrada", 404);
      }

      if (manutencao.status !== "EM_ANDAMENTO") {
        throw new AppError("Esta manutenção já foi finalizada", 409);
      }

      if (dataRetorno < manutencao.dataSaida) {
        throw new AppError(
          "A data de retorno não pode ser anterior à data de saída",
          400,
        );
      }

      const equipamentoAtual = await tx.equipamento.findUnique({
        where: {
          id: manutencao.equipamentoId,
        },
      });

      if (!equipamentoAtual) {
        throw new AppError("Equipamento da manutenção não encontrado", 404);
      }

      const atualizacao: UpdateManutencaoData = {
        diagnostico: data.diagnostico?.trim() || null,

        solucao: data.solucao.trim(),

        dataRetorno,

        status: "FINALIZADA",
      };

      if (data.custo !== undefined) {
        atualizacao.custo = data.custo;
      }

      if (data.observacoes !== undefined) {
        atualizacao.observacoes = data.observacoes?.trim() || null;
      }

      await this.manutencaoRepository.update(manutencao.id, atualizacao, tx);

      await tx.equipamento.update({
        where: {
          id: equipamentoAtual.id,
        },

        data: {
          status: manutencao.statusAnterior,

          responsavelId: manutencao.responsavelAnteriorId,

          localizacaoId: manutencao.localizacaoAnteriorId,
        },
      });

      await this.movimentacaoRepository.create(
        {
          tipo: "RETORNO_MANUTENCAO",

          equipamentoId: equipamentoAtual.id,

          responsavelAnteriorId: equipamentoAtual.responsavelId,

          responsavelNovoId: manutencao.responsavelAnteriorId,

          localizacaoAnteriorId: equipamentoAtual.localizacaoId,

          localizacaoNovaId: manutencao.localizacaoAnteriorId,

          manutencaoId: manutencao.id,

          usuarioId: data.usuarioId ?? null,

          statusAnterior: equipamentoAtual.status,

          statusNovo: manutencao.statusAnterior,

          observacoes: `Retorno da manutenção: ${data.solucao.trim()}`,

          dataHora: dataRetorno,
        },
        tx,
      );

      return this.manutencaoRepository.findById(manutencao.id, tx);
    });
  }

  async buscarComFiltros(filters: ManutencaoFilters) {
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

    let status: StatusManutencao | undefined;

    if (filters.status?.trim()) {
      status = filters.status.trim().toUpperCase() as StatusManutencao;

      if (!this.statusPermitido(status)) {
        throw new AppError("Status da manutenção inválido", 400);
      }
    }

    if (filters.dataInicio) {
      this.validarData(filters.dataInicio, "Data inicial");
    }

    if (filters.dataFim) {
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

    return this.manutencaoRepository.findWithFilters({
      ...filters,
      status,
      page,
      limit,
    });
  }

  private statusPermitido(status: string): status is StatusManutencao {
    return STATUS_MANUTENCAO.some(
      (statusPermitido) => statusPermitido === status,
    );
  }

  private validarId(id: number, campo: string) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(`${campo} inválido`, 400);
    }
  }

  private validarData(data: Date, campo: string) {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      throw new AppError(`${campo} inválida`, 400);
    }
  }

  private validarCusto(custo: number | null | undefined) {
    if (custo === undefined || custo === null) {
      return;
    }

    if (!Number.isFinite(custo) || custo < 0) {
      throw new AppError(
        "O custo deve ser um número maior ou igual a zero",
        400,
      );
    }
  }

  private async validarUsuario(usuarioId: number | null | undefined) {
    if (usuarioId === undefined || usuarioId === null) {
      return;
    }

    this.validarId(usuarioId, "ID do usuário");

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },

      select: {
        id: true,
        ativo: true,
      },
    });

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (!usuario.ativo) {
      throw new AppError("O usuário informado está inativo", 400);
    }
  }
}
