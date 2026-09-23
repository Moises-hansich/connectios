import type { Request, Response } from "express";

import { localizacaoService } from "../services/localizacaoService";
import { usuarioPossuiPermissoes } from "../middlewares/permissaoMiddleware";

function prepararResposta<T extends { equipamentos: unknown }>(
  localizacao: T,
  podeVerEquipamentos: boolean,
): T | Omit<T, "equipamentos"> {
  if (podeVerEquipamentos) {
    return localizacao;
  }

  const resposta: Partial<T> = { ...localizacao };
  delete resposta.equipamentos;

  return resposta as Omit<T, "equipamentos">;
}

// Preserva o status informado pelos erros da aplicação.
// Para erros sem status, mantém o padrão de cada operação.
function responderErro(
  res: Response,
  error: unknown,
  statusPadrao: number,
  mensagemPadrao = "Erro interno.",
) {
  let status = statusPadrao;

  if (typeof error === "object" && error !== null) {
    const codigo =
      "statusCode" in error
        ? error.statusCode
        : "status" in error
          ? error.status
          : undefined;

    if (
      typeof codigo === "number" &&
      Number.isInteger(codigo) &&
      codigo >= 400 &&
      codigo <= 599
    ) {
      status = codigo;
    }
  }

  return res.status(status).json({
    message: error instanceof Error ? error.message : mensagemPadrao,
  });
}

function converterId(valor: unknown): number | null {
  if (typeof valor !== "string" || valor.trim() === "") {
    return null;
  }

  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export class LocalizacaoController {
  async listar(req: Request, res: Response) {
    try {
      const podeVerEquipamentos = await usuarioPossuiPermissoes(
        req.usuario?.usuarioId,
        "equipamentos.visualizar",
      );

      const localizacoes = await localizacaoService.listar();

      return res
        .status(200)
        .json(
          localizacoes.map((localizacao) =>
            prepararResposta(localizacao, podeVerEquipamentos),
          ),
        );
    } catch (error) {
      return responderErro(res, error, 500);
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      if (id === null) {
        return res.status(400).json({
          message: "ID da localização inválido.",
        });
      }

      const podeVerEquipamentos = await usuarioPossuiPermissoes(
        req.usuario?.usuarioId,
        "equipamentos.visualizar",
      );

      const localizacao = await localizacaoService.buscarPorId(id);

      if (!localizacao) {
        return res.status(404).json({
          message: "Localização não encontrada.",
        });
      }

      return res
        .status(200)
        .json(prepararResposta(localizacao, podeVerEquipamentos));
    } catch (error) {
      return responderErro(res, error, 404);
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const localizacao = await localizacaoService.criar(req.body);

      return res.status(201).json(localizacao);
    } catch (error) {
      return responderErro(res, error, 400);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      if (id === null) {
        return res.status(400).json({
          message: "ID da localização inválido.",
        });
      }

      const localizacao = await localizacaoService.atualizar(id, req.body);

      return res.status(200).json(localizacao);
    } catch (error) {
      return responderErro(res, error, 400);
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      if (id === null) {
        return res.status(400).json({
          message: "ID da localização inválido.",
        });
      }

      await localizacaoService.excluir(id);

      return res.status(204).send();
    } catch (error) {
      return responderErro(res, error, 400);
    }
  }

  async listarColaboradores(req: Request, res: Response) {
    try {
      const id = converterId(req.params.id);

      if (id === null) {
        return res.status(400).json({
          message: "ID da localização inválido.",
        });
      }

      // A rota também exige essas quatro permissões.
      const autorizado = await usuarioPossuiPermissoes(
        req.usuario?.usuarioId,
        "localizacoes.visualizar",
        "colaboradores.visualizar",
        "equipamentos.visualizar",
        "zabbix.visualizar",
      );

      if (!autorizado) {
        return res.status(403).json({
          sucesso: false,
          mensagem: "Você não possui permissão para esta operação.",
        });
      }

      const resultado = await localizacaoService.listarColaboradores(id);

      return res.status(200).json(resultado);
    } catch (error) {
      return responderErro(res, error, 404, "Erro ao buscar colaboradores.");
    }
  }
}

export const localizacaoController = new LocalizacaoController();
