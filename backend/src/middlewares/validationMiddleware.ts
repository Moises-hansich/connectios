import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: resultado.error.issues.map((erro) => ({
          campo: erro.path.join("."),
          mensagem: erro.message,
        })),
      });
    }

    req.body = resultado.data;
    next();
  };
}
