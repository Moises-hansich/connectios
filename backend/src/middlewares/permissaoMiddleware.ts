import type { NextFunction, Request, Response } from "express";

import { prisma } from "../prisma";
import { ehPermissaoValida } from "../config/permissoes";

export function exigirPermissao(...chaves: string[]) {
  if (
    chaves.length === 0 ||
    chaves.some((chave) => !ehPermissaoValida(chave))
  ) {
    throw new Error("Permissão inválida na configuração da rota.");
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({
          sucesso: false,
          mensagem: "Usuário não autenticado.",
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: {
          ativo: true,
          perfil: true,
          permissoes: {
            select: { chave: true },
          },
        },
      });

      if (!usuario || !usuario.ativo) {
        return res.status(401).json({
          sucesso: false,
          mensagem: "Usuário inativo ou não encontrado.",
        });
      }

      if (usuario.perfil !== "ADMIN") {
        const permitidas = new Set(
          usuario.permissoes.map((item) => item.chave),
        );

        // Quando houver mais de uma chave, exige todas.
        if (!chaves.every((chave) => permitidas.has(chave))) {
          return res.status(403).json({
            sucesso: false,
            mensagem: "Você não possui permissão para esta operação.",
          });
        }
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
