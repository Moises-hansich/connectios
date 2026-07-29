import type { NextFunction, Request, Response } from "express";

import { MovimentacaoService } from "../services/movimentacaoService";

export class MovimentacaoController {
  private service: MovimentacaoService;

  constructor() {
    this.service = new MovimentacaoService();
  }

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultado = await this.service.buscarComFiltros({
        equipamentoId: this.converterNumeroOpcional(req.query.equipamentoId),

        tipo: this.converterTextoOpcional(req.query.tipo),

        usuarioId: this.converterNumeroOpcional(req.query.usuarioId),

        dataInicio: this.converterDataOpcional(req.query.dataInicio),

        dataFim: this.converterDataOpcional(req.query.dataFim),

        page: this.converterNumeroOpcional(req.query.page),

        limit: this.converterNumeroOpcional(req.query.limit),
      });

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
      const movimentacao = await this.service.registrar({
        tipo: this.converterTextoObrigatorio(req.body.tipo),

        equipamentoId: Number(req.body.equipamentoId),

        responsavelAnteriorId: this.converterNumeroNulavel(
          req.body.responsavelAnteriorId,
        ),

        responsavelNovoId: this.converterNumeroNulavel(
          req.body.responsavelNovoId,
        ),

        localizacaoAnteriorId: this.converterNumeroNulavel(
          req.body.localizacaoAnteriorId,
        ),

        localizacaoNovaId: this.converterNumeroNulavel(
          req.body.localizacaoNovaId,
        ),

        manutencaoId: this.converterNumeroNulavel(req.body.manutencaoId),

        usuarioId: this.converterNumeroNulavel(req.body.usuarioId),

        statusAnterior: this.converterTextoNulavel(req.body.statusAnterior),

        statusNovo: this.converterTextoNulavel(req.body.statusNovo),

        observacoes: this.converterTextoNulavel(req.body.observacoes),

        dataHora: this.converterDataOpcional(req.body.dataHora),
      });

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
    if (valor === undefined) {
      return undefined;
    }

    if (valor === null || valor === "") {
      return null;
    }

    return Number(valor);
  }

  private converterTextoObrigatorio(valor: unknown) {
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
    if (valor === undefined) {
      return undefined;
    }

    if (valor === null) {
      return null;
    }

    return String(valor);
  }

  private converterDataOpcional(valor: unknown): Date | undefined {
    const valorUnico = this.obterValorUnico(valor);

    if (valorUnico === undefined || valorUnico === null || valorUnico === "") {
      return undefined;
    }

    return new Date(String(valorUnico));
  }
}

export const movimentacaoController = new MovimentacaoController();
