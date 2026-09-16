import type { Prisma } from "../generated/prisma/client";
import { AppError } from "../errors/AppError";
import { prisma } from "../prisma";

import {
  type ManutencaoFilters,
  type UpdateManutencaoData,
  ManutencaoRepository,
} from "../repositories/manutencaoRepository";

import { movimentacaoRepository } from "../repositories/movimentacaoRepository";
import { EquipamentoRepository } from "../repositories/equipamentoRepository";
import { empresaRepository } from "../repositories/empresaRepository";

export const STATUS_MANUTENCAO = ["EM_ANDAMENTO", "FINALIZADA"] as const;

export type StatusManutencao = (typeof STATUS_MANUTENCAO)[number];

export type TipoManutencao = "INTERNA" | "EXTERNA";

export interface AbrirManutencaoData {
  equipamentoId: number;
  tipo?: TipoManutencao;
  tecnicoResponsavelId?: number | null;
  problemaInformado: string;
  localManutencao?: string | null;
  empresaResponsavelId?: number | null;
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
  private readonly movimentacaoRepository = movimentacaoRepository;
  private equipamentoRepository: EquipamentoRepository;

  constructor() {
    this.manutencaoRepository = new ManutencaoRepository();

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

  async abrir(data: AbrirManutencaoData, banco?: Prisma.TransactionClient) {
    this.validarId(data.equipamentoId, "ID do equipamento");

    const tipo = data.tipo === undefined ? "EXTERNA" : data.tipo;

    if (tipo !== "INTERNA" && tipo !== "EXTERNA") {
      throw new AppError(
        "O tipo da manutenção deve ser INTERNA ou EXTERNA",
        400,
      );
    }

    const interna = tipo === "INTERNA";

    if (
      typeof data.problemaInformado !== "string" ||
      data.problemaInformado.trim().length < 5
    ) {
      throw new AppError(
        "O problema informado deve possuir pelo menos 5 caracteres",
        400,
      );
    }

    const problema = data.problemaInformado.trim();

    const tecnicoResponsavelId = data.tecnicoResponsavelId ?? null;

    if (interna && tecnicoResponsavelId === null) {
      throw new AppError(
        "Selecione o técnico responsável pela manutenção interna",
        400,
      );
    }

    if (!interna && tecnicoResponsavelId !== null) {
      throw new AppError(
        "O técnico responsável deve ser informado somente na manutenção interna",
        400,
      );
    }

    if (interna && data.empresaResponsavelId != null) {
      throw new AppError(
        "A manutenção interna deve possuir um técnico responsável, sem empresa de assistência",
        400,
      );
    }

    const dataSaida = data.dataSaida ?? new Date();

    this.validarData(dataSaida, interna ? "Data de início" : "Data de saída");

    if (data.previsaoRetorno) {
      this.validarData(
        data.previsaoRetorno,
        interna ? "Previsão de conclusão" : "Previsão de retorno",
      );

      if (data.previsaoRetorno < dataSaida) {
        throw new AppError(
          "A previsão não pode ser anterior ao início da manutenção",
          400,
        );
      }
    }

    this.validarCusto(data.custo);

    await this.validarUsuario(data.registradoPorId);

    const executar = async (tx: Prisma.TransactionClient) => {
      const equipamento = await tx.equipamento.findUnique({
        where: {
          id: data.equipamentoId,
        },
        select: {
          id: true,
          status: true,
          instaladoEmId: true,
          responsavelId: true,
          localizacaoId: true,
          garantiaAte: true,
          fornecedorId: true,
          fornecedor: {
            select: {
              id: true,
              nome: true,
              ativo: true,
            },
          },
        },
      });

      if (!equipamento) {
        throw new AppError("Equipamento não encontrado", 404);
      }

      if (equipamento.instaladoEmId !== null) {
        throw new AppError("Registre o atendimento no computador ou retire a peça antes de abrir sua manutenção.", 409);
      }
      const manutencaoEmAndamento =
        await this.manutencaoRepository.findEmAndamentoByEquipamentoId(
          equipamento.id,
          tx,
        );

      if (manutencaoEmAndamento) {
        throw new AppError(
          "Este equipamento já possui uma manutenção em andamento",
          409,
        );
      }

      if (equipamento.status.trim().toUpperCase() === "EM MANUTENÇÃO") {
        throw new AppError(
          "O equipamento já está marcado como em manutenção",
          409,
        );
      }

      let nomeTecnico: string | null = null;

      if (tecnicoResponsavelId !== null) {
        this.validarId(tecnicoResponsavelId, "ID do técnico responsável");

        const tecnico = await tx.usuario.findUnique({
          where: {
            id: tecnicoResponsavelId,
          },
          select: {
            id: true,
            nome: true,
            ativo: true,
          },
        });

        if (!tecnico) {
          throw new AppError("Técnico responsável não encontrado", 404);
        }

        if (!tecnico.ativo) {
          throw new AppError("O técnico responsável está inativo", 400);
        }

        nomeTecnico = tecnico.nome;
      }

      const garantiaAtiva = this.garantiaEstaAtiva(
        equipamento.garantiaAte,
        dataSaida,
      );

      let empresaResponsavelId = data.empresaResponsavelId ?? null;

      if (!interna) {
        if (garantiaAtiva) {
          if (!equipamento.fornecedorId || !equipamento.fornecedor) {
            throw new AppError(
              "O equipamento está na garantia, mas não possui fornecedor cadastrado",
              400,
            );
          }

          if (!equipamento.fornecedor.ativo) {
            throw new AppError(
              "O fornecedor responsável pela garantia está inativo. Regularize o cadastro da empresa antes de abrir a manutenção",
              400,
            );
          }

          empresaResponsavelId = equipamento.fornecedorId;
        } else if (empresaResponsavelId !== null) {
          this.validarId(empresaResponsavelId, "ID da empresa responsável");

          const empresa = await tx.empresa.findUnique({
            where: {
              id: empresaResponsavelId,
            },
            select: {
              id: true,
              ativo: true,
            },
          });

          if (!empresa) {
            throw new AppError("Empresa responsável não encontrada", 404);
          }

          if (!empresa.ativo) {
            throw new AppError("A empresa responsável está inativa", 400);
          }
        }
      }

      const manutencao = await this.manutencaoRepository.create(
        {
          equipamentoId: equipamento.id,
          tipo,
          tecnicoResponsavelId,

          problemaInformado: problema,
          localManutencao: data.localManutencao?.trim() || null,

          empresaResponsavelId,
          empresaResponsavelTexto: null,

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

      const responsavelNovoId = interna ? equipamento.responsavelId : null;

      const localizacaoNovaId = interna ? equipamento.localizacaoId : null;

      await tx.equipamento.update({
        where: {
          id: equipamento.id,
        },
        data: {
          status: "Em manutenção",
          responsavelId: responsavelNovoId,
          localizacaoId: localizacaoNovaId,
        },
      });

      await tx.equipamento.updateMany({where: {instaladoEmId: equipamento.id}, data: {localizacaoId: localizacaoNovaId}});
      let observacaoMovimentacao: string;

      if (interna) {
        observacaoMovimentacao =
          `Entrada em manutenção interna. ` +
          `Técnico: ${nomeTecnico}. Problema: ${problema}`;

        if (garantiaAtiva) {
          observacaoMovimentacao +=
            " Equipamento com garantia ativa na data de início.";
        }
      } else if (garantiaAtiva && equipamento.fornecedor) {
        observacaoMovimentacao =
          `Entrada em manutenção externa pela garantia. ` +
          `Fornecedor: ${equipamento.fornecedor.nome}. ` +
          `Problema: ${problema}`;
      } else {
        observacaoMovimentacao = `Entrada em manutenção externa. Problema: ${problema}`;
      }

      await this.movimentacaoRepository.create(
        {
          tipo: "ENTRADA_MANUTENCAO",
          equipamentoId: equipamento.id,

          responsavelAnteriorId: equipamento.responsavelId,
          responsavelNovoId,

          localizacaoAnteriorId: equipamento.localizacaoId,
          localizacaoNovaId,

          manutencaoId: manutencao.id,
          usuarioId: data.registradoPorId ?? null,

          statusAnterior: equipamento.status,
          statusNovo: "Em manutenção",

          observacoes: observacaoMovimentacao,
          dataHora: dataSaida,
        },
        tx,
      );

      return this.manutencaoRepository.findById(manutencao.id, tx);
    };
    return banco ? executar(banco) : prisma.$transaction(executar);
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

    if (dataRetorno > new Date()) {
      throw new AppError("A data de retorno não pode estar no futuro", 400);
    }

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

      await tx.equipamento.updateMany({where: {instaladoEmId: equipamentoAtual.id}, data: {localizacaoId: manutencao.localizacaoAnteriorId}});
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

          observacoes: `Retorno da manutenção: ` + data.solucao.trim(),

          dataHora: dataRetorno,
        },
        tx,
      );

      return this.manutencaoRepository.findById(manutencao.id, tx);
    });
  }
  async consultarGarantiaEquipamento(equipamentoId: number) {
    this.validarId(equipamentoId, "ID do equipamento");

    const equipamento = await prisma.equipamento.findUnique({
      where: {
        id: equipamentoId,
      },

      select: {
        id: true,
        nome: true,
        patrimonio: true,
        garantiaAte: true,
        fornecedorId: true,

        fornecedor: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            telefone: true,
            email: true,
            ativo: true,
          },
        },
      },
    });

    if (!equipamento) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    const agora = new Date();

    const garantiaAtiva = this.garantiaEstaAtiva(
      equipamento.garantiaAte,
      agora,
    );

    return {
      equipamento: {
        id: equipamento.id,
        nome: equipamento.nome,
        patrimonio: equipamento.patrimonio,
      },

      possuiGarantia: equipamento.garantiaAte !== null,

      garantiaAtiva,

      garantiaAte: equipamento.garantiaAte,

      diasRestantes:
        garantiaAtiva && equipamento.garantiaAte
          ? this.calcularDiasRestantes(equipamento.garantiaAte, agora)
          : null,

      fornecedor: equipamento.fornecedor,
    };
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

  private async validarEmpresaResponsavel(
    empresaId: number | null | undefined,
  ) {
    if (empresaId === undefined || empresaId === null) {
      return;
    }

    this.validarId(empresaId, "ID da empresa responsável");

    const empresa = await empresaRepository.findById(empresaId);

    if (!empresa) {
      throw new AppError("Empresa responsável não encontrada", 404);
    }

    if (!empresa.ativo) {
      throw new AppError("A empresa responsável está inativa", 400);
    }
  }
  private obterDataCalendarioBrasil(data: Date): Date {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(data);

    const ano = Number(partes.find((parte) => parte.type === "year")?.value);

    const mes = Number(partes.find((parte) => parte.type === "month")?.value);

    const dia = Number(partes.find((parte) => parte.type === "day")?.value);

    return new Date(Date.UTC(ano, mes - 1, dia));
  }

  private obterDataGarantia(data: Date): Date {
    return new Date(
      Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()),
    );
  }

  private garantiaEstaAtiva(
    garantiaAte: Date | null,
    dataReferencia: Date,
  ): boolean {
    if (!garantiaAte) {
      return false;
    }

    const dataGarantia = this.obterDataGarantia(garantiaAte);

    const dataAtual = this.obterDataCalendarioBrasil(dataReferencia);

    return dataGarantia.getTime() >= dataAtual.getTime();
  }

  private calcularDiasRestantes(
    garantiaAte: Date,
    dataReferencia: Date,
  ): number {
    const dataGarantia = this.obterDataGarantia(garantiaAte);

    const dataAtual = this.obterDataCalendarioBrasil(dataReferencia);

    const milissegundosDia = 24 * 60 * 60 * 1000;

    return Math.max(
      0,
      Math.round(
        (dataGarantia.getTime() - dataAtual.getTime()) / milissegundosDia,
      ),
    );
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
