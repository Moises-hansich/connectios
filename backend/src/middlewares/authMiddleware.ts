import type { NextFunction, Request, Response } from "express";

import { prisma } from "../prisma";
import { verificarToken } from "../utils/jwt";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token não informado.",
    });
  }

  const partes = authorization.trim().split(/\s+/);
  const [tipo, token] = partes;

  if (partes.length !== 2 || tipo?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token inválido.",
    });
  }

  let usuarioId: number;

  try {
    const payload = verificarToken(token);

    if (!Number.isSafeInteger(payload.usuarioId) || payload.usuarioId <= 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token inválido.",
      });
    }

    usuarioId = payload.usuarioId;
  } catch {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token expirado ou inválido.",
    });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
      select: {
        id: true,
        email: true,
        perfil: true,
        ativo: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Sua conta está inativa ou não está mais disponível.",
      });
    }

    // As permissões vêm do cadastro atual, não do perfil antigo do token.
    req.usuario = {
      usuarioId: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    };
  } catch (error) {
    return next(error);
  }

  return next();
}
