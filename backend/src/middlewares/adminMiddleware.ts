import type { NextFunction, Request, Response } from "express";

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.usuario) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Usuário não autenticado.",
    });
  }

  if (req.usuario.perfil !== "ADMIN") {
    return res.status(403).json({
      sucesso: false,
      mensagem: "Acesso permitido apenas para administradores.",
    });
  }

  next();
}
