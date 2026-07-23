import { z } from "zod";

const campoOpcional = z
  .string()
  .trim()
  .optional()
  .transform((valor) => (valor === "" ? undefined : valor));

export const criarTipoHardwareSchema = z.object({
  nome: z
    .string({ message: "Nome é obrigatório" })
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres"),

  descricao: campoOpcional,

  ordem: z
    .union([
      z.number(),
      z
        .string()
        .trim()
        .transform((valor) => Number(valor)),
    ])
    .refine((valor) => Number.isInteger(valor) && valor >= 0, "Ordem inválida")
    .optional()
    .default(0),

  ativo: z
    .union([z.boolean(), z.string().transform((valor) => valor === "true")])
    .optional()
    .default(true),
});

export const atualizarTipoHardwareSchema = criarTipoHardwareSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe pelo menos um campo para atualizar",
  });

export type CriarTipoHardwareInput = z.infer<typeof criarTipoHardwareSchema>;

export type AtualizarTipoHardwareInput = z.infer<
  typeof atualizarTipoHardwareSchema
>;
