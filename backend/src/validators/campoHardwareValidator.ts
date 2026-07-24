import { z } from "zod";

const tipoCampoSchema = z.enum([
  "TEXTO",
  "NUMERO",
  "BOOLEANO",
  "DATA",
  "LISTA",
]);

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

  tipo: tipoCampoSchema,

  obrigatorio: z.boolean().default(false),

  ordem: z
    .number({
      error: "A ordem deve ser um número.",
    })
    .int("A ordem deve ser um número inteiro.")
    .min(0, "A ordem não pode ser negativa.")
    .default(0),

  ativo: z.boolean().default(true),
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
