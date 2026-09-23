import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";

import type {
  CreateMovimentacaoData,
  MovimentacaoFilters,
} from "../repositories/movimentacaoRepository";

import { movimentacaoService } from "../services/movimentacaoService";

class MovimentacaoController {
  private readonly service = movimentacaoService;

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: MovimentacaoFilters = {};

      const equipamentoId = this.converterNumeroOpcional(
        req.query.equipamentoId,
      );

      const tipo = this.converterTextoOpcional(req.query.tipo);

      const usuarioId = this.converterNumeroOpcional(req.query.usuarioId);

      const dataInicio = this.converterDataOpcional(req.query.dataInicio);

      const dataFim = this.converterDataOpcional(req.query.dataFim);

      const page = this.converterNumeroOpcional(req.query.page);

      const limit = this.converterNumeroOpcional(req.query.limit);

      if (equipamentoId !== undefined) {
        filters.equipamentoId = equipamentoId;
      }

      if (tipo !== undefined) {
        filters.tipo = tipo;
      }

      if (usuarioId !== undefined) {
        filters.usuarioId = usuarioId;
      }

      if (dataInicio !== undefined) {
        filters.dataInicio = dataInicio;
      }

      if (dataFim !== undefined) {
        filters.dataFim = dataFim;
      }

      if (page !== undefined) {
        filters.page = page;
      }

      if (limit !== undefined) {
        filters.limit = limit;
      }

      const resultado = await this.service.buscarComFiltros(filters);

      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  buscarPorId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      const movimentacao = await this.service.buscarPorId(id);

      return res.status(200).json(movimentacao);
    } catch (error) {
      next(error);
    }
  };

  buscarPorEquipamento = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const equipamentoId = Number(req.params.equipamentoId);

      const movimentacoes =
        await this.service.buscarPorEquipamento(equipamentoId);

      return res.status(200).json(movimentacoes);
    } catch (error) {
      next(error);
    }
  };

  registrar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario) {
        throw new AppError("Usuário não autenticado", 401);
      }

      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        throw new AppError("Dados da movimentação inválidos", 400);
      }

      const data: CreateMovimentacaoData = {
        tipo: this.converterTextoObrigatorio(req.body.tipo),
        equipamentoId: Number(req.body.equipamentoId),

        // A autoria vem da autenticação, nunca do corpo da requisição.
        usuarioId: req.usuario.usuarioId,
      };

      this.adicionarNumeroNulavel(
        data,
        "equipamentoRelacionadoId",
        req.body.equipamentoRelacionadoId,
      );

      this.adicionarNumeroNulavel(
        data,
        "responsavelAnteriorId",
        req.body.responsavelAnteriorId,
      );

      this.adicionarNumeroNulavel(
        data,
        "responsavelNovoId",
        req.body.responsavelNovoId,
      );

      this.adicionarNumeroNulavel(
        data,
        "setorAnteriorId",
        req.body.setorAnteriorId,
      );

      this.adicionarNumeroNulavel(data, "setorNovoId", req.body.setorNovoId);

      this.adicionarNumeroNulavel(
        data,
        "localizacaoAnteriorId",
        req.body.localizacaoAnteriorId,
      );

      this.adicionarNumeroNulavel(
        data,
        "localizacaoNovaId",
        req.body.localizacaoNovaId,
      );

      this.adicionarNumeroNulavel(data, "manutencaoId", req.body.manutencaoId);

      this.adicionarTextoNulavel(
        data,
        "statusAnterior",
        req.body.statusAnterior,
      );

      this.adicionarTextoNulavel(data, "statusNovo", req.body.statusNovo);

      this.adicionarTextoNulavel(data, "observacoes", req.body.observacoes);

      const dataHora = this.converterDataOpcional(req.body.dataHora);

      if (dataHora !== undefined) {
        data.dataHora = dataHora;
      }

      const movimentacao = await this.service.registrar(data);

      return res.status(201).json({
        mensagem: "Movimentação registrada com sucesso",
        movimentacao,
      });
    } catch (error) {
      next(error);
    }
  };

  private obterValorUnico(valor: unknown) {
    if (Array.isArray(valor)) {
      return valor[0];
    }

    return valor;
  }

  private converterNumeroOpcional(valor: unknown): number | undefined {
    const valorUnico = this.obterValorUnico(valor);

    if (valorUnico === undefined || valorUnico === null || valorUnico === "") {
      return undefined;
    }

    return Number(valorUnico);
  }

  private converterNumeroNulavel(valor: unknown): number | null | undefined {
    const valorUnico = this.obterValorUnico(valor);

    if (valorUnico === undefined) {
      return undefined;
    }

    if (valorUnico === null || valorUnico === "") {
      return null;
    }

    return Number(valorUnico);
  }

  private converterTextoObrigatorio(valor: unknown): string {
    return String(valor ?? "");
  }

  private converterTextoOpcional(valor: unknown): string | undefined {
    const valorUnico = this.obterValorUnico(valor);

    if (valorUnico === undefined || valorUnico === null || valorUnico === "") {
      return undefined;
    }

    return String(valorUnico);
  }

  private converterTextoNulavel(valor: unknown): string | null | undefined {
    const valorUnico = this.obterValorUnico(valor);

    if (valorUnico === undefined) {
      return undefined;
    }

    if (valorUnico === null) {
      return null;
    }

    return String(valorUnico);
  }

  private converterDataOpcional(valor: unknown): Date | undefined {
    const valorUnico = this.obterValorUnico(valor);

    if (valorUnico === undefined || valorUnico === null || valorUnico === "") {
      return undefined;
    }

    return new Date(String(valorUnico));
  }

  private adicionarNumeroNulavel<K extends keyof CreateMovimentacaoData>(
    destino: CreateMovimentacaoData,
    campo: K,
    valor: unknown,
  ) {
    const convertido = this.converterNumeroNulavel(valor);

    if (convertido !== undefined) {
      destino[campo] = convertido as CreateMovimentacaoData[K];
    }
  }

  private adicionarTextoNulavel<K extends keyof CreateMovimentacaoData>(
    destino: CreateMovimentacaoData,
    campo: K,
    valor: unknown,
  ) {
    const convertido = this.converterTextoNulavel(valor);

    if (convertido !== undefined) {
      destino[campo] = convertido as CreateMovimentacaoData[K];
    }
  }
}

export const movimentacaoController = new MovimentacaoController();
