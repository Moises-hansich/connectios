import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";
import { prisma } from "../prisma";
import { ehPermissaoValida } from "../config/permissoes";

function validarChaves(chaves: string[]) {
  if (
    chaves.length === 0 ||
    chaves.some((chave) => !ehPermissaoValida(chave))
  ) {
    throw new Error("Permissão inválida na configuração da rota.");
  }
}

// Compartilha a mesma regra entre middleware e controllers.
// Consulta as permissões atuais do usuário no banco.
export async function usuarioPossuiPermissoes(
  usuarioId: number | undefined,
  ...chaves: string[]
): Promise<boolean> {
  validarChaves(chaves);

  if (
    usuarioId === undefined ||
    !Number.isSafeInteger(usuarioId) ||
    usuarioId <= 0
  ) {
    throw new AppError("Usuário não autenticado.", 401);
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    select: {
      ativo: true,
      perfil: true,
      permissoes: {
        select: {
          chave: true,
        },
      },
    },
  });

  if (!usuario || !usuario.ativo) {
    throw new AppError("Usuário inativo ou não encontrado.", 401);
  }

  if (usuario.perfil === "ADMIN") {
    return true;
  }

  const permitidas = new Set(usuario.permissoes.map((item) => item.chave));

  return chaves.every((chave) => permitidas.has(chave));
}

export function exigirPermissao(...chaves: string[]) {
  validarChaves(chaves);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const autorizado = await usuarioPossuiPermissoes(
        req.usuario?.usuarioId,
        ...chaves,
      );

      if (!autorizado) {
        return res.status(403).json({
          sucesso: false,
          mensagem: "Você não possui permissão para esta operação.",
        });
      }

      return next();
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 401) {
        return res.status(401).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      return next(error);
    }
  };
}
