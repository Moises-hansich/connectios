import { z } from "zod";

export const criarHardwareSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome deve possuir pelo menos 2 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),

  fabricante: z.string().trim().max(100).optional(),

  modelo: z.string().trim().max(100).optional(),

  numeroSerie: z.string().trim().max(100).optional(),

  observacoes: z.string().trim().max(500).optional(),

  tipoHardwareId: z.number().int().positive("Tipo de hardware inválido."),

  equipamentoId: z.number().int().positive("Equipamento inválido."),
});

export const atualizarHardwareSchema = criarHardwareSchema
  .partial()
  .refine(
    (dados) => Object.keys(dados).length > 0,
    "Informe pelo menos um campo para atualização.",
  );

export type CriarHardwareInput = z.infer<typeof criarHardwareSchema>;

export type AtualizarHardwareInput = z.infer<typeof atualizarHardwareSchema>;
