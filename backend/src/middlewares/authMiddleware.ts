import type { NextFunction, Request, Response } from "express";

import { verificarToken } from "../utils/jwt";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token não informado",
    });
  }

  const [tipo, token] = authorization.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token inválido",
    });
  }

  try {
    const payload = verificarToken(token);

    req.usuario = payload;

    next();
  } catch {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token expirado ou inválido",
    });
  }
}
