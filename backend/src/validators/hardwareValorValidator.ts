import { z } from "zod";

export const criarHardwareValorSchema = z.object({
  valor: z
    .string()
    .trim()
    .min(1, "O valor é obrigatório.")
    .max(255, "O valor deve possuir no máximo 255 caracteres."),

  hardwareId: z
    .number({
      error: "Hardware é obrigatório.",
    })
    .int("Hardware inválido.")
    .positive("Hardware inválido."),

  campoHardwareId: z
    .number({
      error: "Campo de hardware é obrigatório.",
    })
    .int("Campo de hardware inválido.")
    .positive("Campo de hardware inválido."),
});

export const atualizarHardwareValorSchema = criarHardwareValorSchema.partial();

export type CriarHardwareValorInput = z.infer<typeof criarHardwareValorSchema>;

export type AtualizarHardwareValorInput = z.infer<
  typeof atualizarHardwareValorSchema
>;
