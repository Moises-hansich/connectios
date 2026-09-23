import type { Request, Response } from "express";

import { ColaboradorService } from "../services/colaboradorService";
import { AppError } from "../errors/AppError";

import { usuarioPossuiPermissoes } from "../middlewares/permissaoMiddleware";

// Omite a propriedade quando o usuário não pode visualizar equipamentos.
// Não retorna [] para evitar representar dados ocultos como lista vazia.
function prepararResposta<T extends { equipamentos: unknown }>(
  colaborador: T,
  podeVerEquipamentos: boolean,
): T | Omit<T, "equipamentos"> {
  if (podeVerEquipamentos) {
    return colaborador;
  }

  const resposta: Partial<T> = { ...colaborador };
  delete resposta.equipamentos;

  return resposta as Omit<T, "equipamentos">;
}

export class ColaboradorController {
  private readonly service = new ColaboradorService();

  private async podeVerEquipamentos(req: Request) {
    return usuarioPossuiPermissoes(
      req.usuario?.usuarioId,
      "equipamentos.visualizar",
    );
  }

  private validarId(valor: unknown) {
    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("ID inválido", 400);
    }

    return id;
  }

  async listarTodos(req: Request, res: Response) {
    const podeVerEquipamentos = await this.podeVerEquipamentos(req);

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    let ativo: boolean | undefined;

    if (req.query.ativo !== undefined) {
      if (req.query.ativo !== "true" && req.query.ativo !== "false") {
        throw new AppError('O filtro ativo deve ser "true" ou "false".', 400);
      }

      ativo = req.query.ativo === "true";
    }

    const localizacaoId =
      typeof req.query.localizacaoId === "string"
        ? Number(req.query.localizacaoId)
        : undefined;

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;

    const resultado = await this.service.buscarComFiltros({
      ...(search !== undefined ? { search } : {}),
      ...(ativo !== undefined ? { ativo } : {}),
      ...(localizacaoId !== undefined ? { localizacaoId } : {}),
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: resultado.colaboradores.map((colaborador) =>
        prepararResposta(colaborador, podeVerEquipamentos),
      ),
      pagination: {
        total: resultado.total,
        page: resultado.page,
        limit: resultado.limit,
        totalPages: resultado.totalPages,
      },
    });
  }

  async criar(req: Request, res: Response) {
    const podeVerEquipamentos = await this.podeVerEquipamentos(req);

    const colaborador = await this.service.criar(req.body);

    return res.status(201).json({
      success: true,
      message: "Colaborador cadastrado com sucesso",
      data: prepararResposta(colaborador, podeVerEquipamentos),
    });
  }

  async buscarPorId(req: Request, res: Response) {
    const id = this.validarId(req.params.id);

    const podeVerEquipamentos = await this.podeVerEquipamentos(req);

    const colaborador = await this.service.buscarPorId(id);

    return res.status(200).json({
      success: true,
      data: prepararResposta(colaborador, podeVerEquipamentos),
    });
  }

  async buscarCompleto(req: Request, res: Response) {
    const id = this.validarId(req.params.id);

    // A rota também exige essas permissões.
    const autorizado = await usuarioPossuiPermissoes(
      req.usuario?.usuarioId,
      "colaboradores.visualizar",
      "equipamentos.visualizar",
      "hardware.visualizar",
    );

    if (!autorizado) {
      throw new AppError("Você não possui permissão para esta operação.", 403);
    }

    const colaborador = await this.service.buscarCompleto(id);

    return res.status(200).json({
      success: true,
      data: colaborador,
    });
  }

  async atualizar(req: Request, res: Response) {
    const id = this.validarId(req.params.id);

    const podeVerEquipamentos = await this.podeVerEquipamentos(req);

    const colaborador = await this.service.atualizar(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Colaborador atualizado com sucesso",
      data: prepararResposta(colaborador, podeVerEquipamentos),
    });
  }

  async deletar(req: Request, res: Response) {
    const id = this.validarId(req.params.id);

    await this.service.deletar(id);

    return res.status(200).json({
      success: true,
      message: "Colaborador deletado com sucesso",
    });
  }
}
