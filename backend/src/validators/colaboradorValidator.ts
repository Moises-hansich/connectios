import { z } from "zod";

const campoOpcional = z
  .string()
  .trim()
  .optional()
  .transform((valor) => (valor === "" ? undefined : valor));

const localizacaoIdSchema = z
  .union([
    z.number(),
    z
      .string()
      .trim()
      .transform((valor) => Number(valor)),
  ])
  .refine(
    (valor) => Number.isInteger(valor) && valor > 0,
    "Localização inválida",
  )
  .nullable()
  .optional();

export const criarColaboradorSchema = z.object({
  nome: z
    .string({ message: "Nome é obrigatório" })
    .trim()
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  email: campoOpcional.refine(
    (valor) => !valor || z.string().email().safeParse(valor).success,
    "E-mail inválido",
  ),

  telefone: campoOpcional,

  cargo: campoOpcional,

  localizacaoId: localizacaoIdSchema,

  ativo: z.boolean().optional(),
});

export const atualizarColaboradorSchema = criarColaboradorSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe pelo menos um campo para atualizar",
  });

export type CriarColaboradorInput = z.infer<typeof criarColaboradorSchema>;

export type AtualizarColaboradorInput = z.infer<
  typeof atualizarColaboradorSchema
>;
