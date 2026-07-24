import { z } from "zod";

const tipoDadoSchema = z.enum(["texto", "numero", "booleano", "data", "lista"]);

export const criarCampoHardwareSchema = z.object({
  tipoHardwareId: z
    .number({
      error: "O ID do tipo de hardware deve ser um número.",
    })
    .int("O ID do tipo de hardware deve ser um número inteiro.")
    .positive("O ID do tipo de hardware deve ser maior que zero."),

  nome: z
    .string({
      error: "O nome do campo é obrigatório.",
    })
    .trim()
    .min(2, "O nome deve possuir pelo menos 2 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),

  chave: z
    .string({
      error: "A chave do campo é obrigatória.",
    })
    .trim()
    .min(2, "A chave deve possuir pelo menos 2 caracteres.")
    .max(100, "A chave deve possuir no máximo 100 caracteres.")
    .regex(
      /^[a-z0-9_]+$/,
      "A chave deve conter apenas letras minúsculas, números e underline.",
    ),

  tipoDado: tipoDadoSchema.default("texto"),

  unidade: z
    .string()
    .trim()
    .max(30, "A unidade deve possuir no máximo 30 caracteres.")
    .optional()
    .nullable(),

  placeholder: z
    .string()
    .trim()
    .max(150, "O placeholder deve possuir no máximo 150 caracteres.")
    .optional()
    .nullable(),

  obrigatorio: z.boolean().default(false),

  ativo: z.boolean().default(true),

  ordem: z
    .number({
      error: "A ordem deve ser um número.",
    })
    .int("A ordem deve ser um número inteiro.")
    .min(0, "A ordem não pode ser negativa.")
    .default(0),
});

export const atualizarCampoHardwareSchema = criarCampoHardwareSchema
  .omit({
    tipoHardwareId: true,
  })
  .partial()
  .refine(
    (dados) => Object.keys(dados).length > 0,
    "Informe pelo menos um campo para atualização.",
  );

export type CriarCampoHardwareInput = z.infer<typeof criarCampoHardwareSchema>;

export type AtualizarCampoHardwareInput = z.infer<
  typeof atualizarCampoHardwareSchema
>;
