import jwt from "jsonwebtoken";

export interface TokenPayload {
  usuarioId: number;
  email: string;
  perfil: string;
}

function obterJWTSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("A variável de ambiente JWT_SECRET não foi configurada.");
  }

  return secret;
}

export function gerarToken(payload: TokenPayload): string {
  return jwt.sign(payload, obterJWTSecret(), {
    expiresIn: "8h",
  });
}

export function verificarToken(token: string): TokenPayload {
  const payload = jwt.verify(token, obterJWTSecret());

  if (
    typeof payload === "string" ||
    typeof payload.usuarioId !== "number" ||
    typeof payload.email !== "string" ||
    typeof payload.perfil !== "string"
  ) {
    throw new Error("Token inválido.");
  }

  return {
    usuarioId: payload.usuarioId,
    email: payload.email,
    perfil: payload.perfil,
  };
}
