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

export const criarEquipamentoSchema = z.object({
  nome: z
    .string({ message: "Nome é obrigatório" })
    .trim()
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  categoria: z
    .string({ message: "Categoria é obrigatória" })
    .trim()
    .min(1, "Categoria é obrigatória"),

  fabricante: campoOpcional,
  modelo: campoOpcional,
  numeroSerie: campoOpcional,
  patrimonio: campoOpcional,

  status: z
    .string({ message: "Status é obrigatório" })
    .trim()
    .min(1, "Status é obrigatório"),

  localizacaoId: localizacaoIdSchema,

  observacoes: campoOpcional,
});

export const atualizarEquipamentoSchema = criarEquipamentoSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe pelo menos um campo para atualizar",
  });

export type CriarEquipamentoInput = z.infer<typeof criarEquipamentoSchema>;

export type AtualizarEquipamentoInput = z.infer<
  typeof atualizarEquipamentoSchema
>;
