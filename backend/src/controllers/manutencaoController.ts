import type { NextFunction, Request, Response } from "express";

import {
  ManutencaoService,
  type TipoManutencao,
} from "../services/manutencaoService";

import { AppError } from "../errors/AppError";

export class ManutencaoController {
  private service: ManutencaoService;

  constructor() {
    this.service = new ManutencaoService();
  }

  listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultado = await this.service.buscarComFiltros({
        equipamentoId: this.converterNumeroOpcional(req.query.equipamentoId),
        status: this.converterTextoOpcional(req.query.status),
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

      const manutencao = await this.service.buscarPorId(id);

      return res.status(200).json(manutencao);
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

      const manutencoes =
        await this.service.buscarPorEquipamento(equipamentoId);

      return res.status(200).json(manutencoes);
    } catch (error) {
      next(error);
    }
  };

  abrir = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioId = this.obterUsuarioAutenticadoId(req);

      this.validarCorpo(req.body);

      const manutencao = await this.service.abrir({
        equipamentoId: Number(req.body.equipamentoId),

        tipo: this.converterTipoManutencao(req.body.tipo),

        tecnicoResponsavelId: this.converterTecnicoResponsavel(
          req.body.tecnicoResponsavelId,
        ),

        problemaInformado: this.converterTextoObrigatorio(
          req.body.problemaInformado,
        ),

        localManutencao: this.converterTextoNulavel(req.body.localManutencao),

        empresaResponsavelId: this.converterNumeroNulavel(
          req.body.empresaResponsavelId,
        ),

        previsaoRetorno: this.converterDataNulavel(req.body.previsaoRetorno),

        custo: this.converterNumeroNulavel(req.body.custo),

        observacoes: this.converterTextoNulavel(req.body.observacoes),

        // A autoria vem do usuário autenticado.
        registradoPorId: usuarioId,

        dataSaida: this.converterDataOpcional(req.body.dataSaida),
      });

      return res.status(201).json({
        mensagem: "Manutenção aberta com sucesso",
        manutencao,
      });
    } catch (error) {
      next(error);
    }
  };

  consultarGarantia = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const equipamentoId = Number(req.params.equipamentoId);

      const garantia =
        await this.service.consultarGarantiaEquipamento(equipamentoId);

      return res.status(200).json(garantia);
    } catch (error) {
      next(error);
    }
  };

  finalizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioId = this.obterUsuarioAutenticadoId(req);

      this.validarCorpo(req.body);

      const id = Number(req.params.id);

      const manutencao = await this.service.finalizar(id, {
        diagnostico: this.converterTextoNulavel(req.body.diagnostico),

        solucao: this.converterTextoObrigatorio(req.body.solucao),

        custo: this.converterNumeroNulavel(req.body.custo),

        observacoes: this.converterTextoNulavel(req.body.observacoes),

        // Identifica quem realmente finalizou o atendimento.
        usuarioId,

        dataRetorno: this.converterDataOpcional(req.body.dataRetorno),
      });

      return res.status(200).json({
        mensagem: "Manutenção finalizada com sucesso",
        manutencao,
      });
    } catch (error) {
      next(error);
    }
  };

  private obterUsuarioAutenticadoId(req: Request): number {
    const usuarioId = req.usuario?.usuarioId;

    if (
      typeof usuarioId !== "number" ||
      !Number.isSafeInteger(usuarioId) ||
      usuarioId <= 0
    ) {
      throw new AppError("Usuário não autenticado", 401);
    }

    return usuarioId;
  }

  private validarCorpo(valor: unknown): void {
    if (valor === null || typeof valor !== "object" || Array.isArray(valor)) {
      throw new AppError("Dados inválidos", 400);
    }
  }

  private converterTipoManutencao(valor: unknown): TipoManutencao | undefined {
    // O serviço assume EXTERNA quando o campo não é enviado.
    if (valor === undefined) {
      return undefined;
    }

    if (typeof valor !== "string") {
      throw new AppError(
        "O tipo da manutenção deve ser INTERNA ou EXTERNA",
        400,
      );
    }

    const tipo = valor.trim().toUpperCase();

    if (tipo !== "INTERNA" && tipo !== "EXTERNA") {
      throw new AppError(
        "O tipo da manutenção deve ser INTERNA ou EXTERNA",
        400,
      );
    }

    return tipo;
  }

  private converterTecnicoResponsavel(
    valor: unknown,
  ): number | null | undefined {
    if (valor === undefined) {
      return undefined;
    }

    if (valor === null || valor === "") {
      return null;
    }

    if (typeof valor !== "string" && typeof valor !== "number") {
      throw new AppError("ID do técnico responsável inválido", 400);
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("ID do técnico responsável inválido", 400);
    }

    return id;
  }

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

  private converterDataNulavel(valor: unknown): Date | null | undefined {
    if (valor === undefined) {
      return undefined;
    }

    if (valor === null || valor === "") {
      return null;
    }

    return new Date(String(valor));
  }
}

export const manutencaoController = new ManutencaoController();
