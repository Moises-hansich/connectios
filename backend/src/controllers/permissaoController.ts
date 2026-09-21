import type { NextFunction, Request, Response } from "express";

import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";
import {
  GRUPOS_PERMISSOES,
  TODAS_PERMISSOES,
  ehPermissaoValida,
} from "../config/permissoes";

function obterId(req: Request): number {
  const valor = req.params.id;
  const id = Number(Array.isArray(valor) ? valor[0] : valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError("ID do usuário inválido.", 400);
  }

  return id;
}

export const permissaoController = {
  async catalogo(_req: Request, res: Response, _next: NextFunction) {
    return res.status(200).json({
      sucesso: true,
      data: GRUPOS_PERMISSOES,
    });
  },

  async minhas(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        throw new AppError("Usuário não autenticado.", 401);
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: {
          perfil: true,
          ativo: true,
          permissoes: {
            select: { chave: true },
          },
        },
      });

      if (!usuario || !usuario.ativo) {
        throw new AppError("Usuário inativo ou não encontrado.", 401);
      }

      return res.status(200).json({
        sucesso: true,
        data: {
          perfil: usuario.perfil,
          permissoes:
            usuario.perfil === "ADMIN"
              ? TODAS_PERMISSOES
              : usuario.permissoes
                  .map((item) => item.chave)
                  .filter(ehPermissaoValida),
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async buscar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = obterId(req);

      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          perfil: true,
          permissoes: {
            select: { chave: true },
            orderBy: { chave: "asc" },
          },
        },
      });

      if (!usuario) {
        throw new AppError("Usuário não encontrado.", 404);
      }

      return res.status(200).json({
        sucesso: true,
        data: {
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            perfil: usuario.perfil,
          },
          permissoes:
            usuario.perfil === "ADMIN"
              ? TODAS_PERMISSOES
              : usuario.permissoes
                  .map((item) => item.chave)
                  .filter(ehPermissaoValida),
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = obterId(req);
      const autorId = req.usuario?.usuarioId;
      const recebidas: unknown = req.body?.permissoes;

      if (!autorId) {
        throw new AppError("Usuário não autenticado.", 401);
      }

      if (
        !Array.isArray(recebidas) ||
        recebidas.length > TODAS_PERMISSOES.length ||
        !recebidas.every(
          (chave): chave is string =>
            typeof chave === "string" && ehPermissaoValida(chave),
        )
      ) {
        throw new AppError("A lista de permissões é inválida.", 400);
      }

      const permissoes = [...new Set(recebidas)];

      const resultado = await prisma.$transaction(async (tx) => {
        const autor = await tx.usuario.findUnique({
          where: { id: autorId },
          select: { ativo: true, perfil: true },
        });

        if (!autor || !autor.ativo || autor.perfil !== "ADMIN") {
          throw new AppError(
            "Somente administradores ativos podem alterar permissões.",
            403,
          );
        }

        const usuario = await tx.usuario.findUnique({
          where: { id },
          select: { id: true, nome: true, perfil: true },
        });

        if (!usuario) {
          throw new AppError("Usuário não encontrado.", 404);
        }

        if (usuario.perfil === "ADMIN") {
          throw new AppError(
            "Administradores possuem acesso completo. As permissões individuais são destinadas aos demais perfis.",
            400,
          );
        }

        await tx.usuarioPermissao.deleteMany({
          where: { usuarioId: id },
        });

        if (permissoes.length > 0) {
          await tx.usuarioPermissao.createMany({
            data: permissoes.map((chave) => ({
              usuarioId: id,
              chave,
            })),
          });
        }

        return { usuario, permissoes };
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Permissões atualizadas com sucesso.",
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  },
};
