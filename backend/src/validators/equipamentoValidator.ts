import { z } from "zod";

const campoTextoOpcional = z.preprocess((valor) => {
  if (typeof valor === "string") {
    const texto = valor.trim();

    return texto === "" ? null : texto;
  }

  return valor;
}, z.string().trim().nullable().optional());

const criarIdOpcionalSchema = (mensagem: string) =>
  z.preprocess(
    (valor) => {
      if (valor === null || valor === undefined) {
        return valor;
      }

      if (typeof valor === "string") {
        const texto = valor.trim();

        return texto === "" ? null : Number(texto);
      }

      return valor;
    },
    z
      .number({ message: mensagem })
      .int(mensagem)
      .positive(mensagem)
      .nullable()
      .optional(),
  );

const categoriaIdSchema = z.preprocess(
  (valor) => {
    if (typeof valor === "string") {
      const texto = valor.trim();

      return texto === "" ? undefined : Number(texto);
    }

    return valor;
  },
  z
    .number({ message: "Categoria é obrigatória" })
    .int("Categoria inválida")
    .positive("Categoria inválida"),
);

const setorIdSchema = criarIdOpcionalSchema("Setor inválido");

const localizacaoIdSchema = criarIdOpcionalSchema("Localização inválida");

const responsavelIdSchema = criarIdOpcionalSchema("Responsável inválido");

const fornecedorIdSchema = criarIdOpcionalSchema("Fornecedor inválido");

function dataValida(valor: string | Date) {
  if (valor instanceof Date) {
    return !Number.isNaN(valor.getTime());
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const data = new Date(`${valor}T00:00:00.000Z`);

    return (
      !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor
    );
  }

  return !Number.isNaN(new Date(valor).getTime());
}

const criarDataOpcionalSchema = (campo: string) =>
  z.preprocess(
    (valor) => {
      if (typeof valor === "string") {
        const texto = valor.trim();

        return texto === "" ? null : texto;
      }

      return valor;
    },
    z
      .union([z.string(), z.date()])
      .refine((valor) => dataValida(valor), {
        message: `${campo} inválida`,
      })
      .nullable()
      .optional(),
  );

const dataCompraSchema = criarDataOpcionalSchema("Data da compra");

const garantiaAteSchema = criarDataOpcionalSchema("Data da garantia");

const equipamentoBaseSchema = z.object({
  nome: z
    .string({ message: "Nome é obrigatório" })
    .trim()
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  categoriaId: categoriaIdSchema,

  fabricante: campoTextoOpcional,
  modelo: campoTextoOpcional,
  numeroSerie: campoTextoOpcional,
  patrimonio: campoTextoOpcional,

  status: z
    .string({ message: "Status é obrigatório" })
    .trim()
    .min(1, "Status é obrigatório"),

  setorId: setorIdSchema,
  localizacaoId: localizacaoIdSchema,
  responsavelId: responsavelIdSchema,
  fornecedorId: fornecedorIdSchema,

  dataCompra: dataCompraSchema,
  garantiaAte: garantiaAteSchema,

  observacoes: campoTextoOpcional,
});

interface DadosComGarantia {
  dataCompra?: string | Date | null;
  garantiaAte?: string | Date | null;
  fornecedorId?: number | null;
}

function validarPeriodoGarantia(
  dados: DadosComGarantia,
  contexto: z.RefinementCtx,
) {
  if (
    dados.dataCompra !== null &&
    dados.dataCompra !== undefined &&
    dados.garantiaAte !== null &&
    dados.garantiaAte !== undefined
  ) {
    const dataCompra = new Date(dados.dataCompra);
    const garantiaAte = new Date(dados.garantiaAte);

    if (garantiaAte.getTime() < dataCompra.getTime()) {
      contexto.addIssue({
        code: "custom",
        path: ["garantiaAte"],
        message: "A data da garantia não pode ser anterior à data da compra",
      });
    }
  }
}

export const criarEquipamentoSchema = equipamentoBaseSchema.superRefine(
  (dados, contexto) => {
    validarPeriodoGarantia(dados, contexto);

    if (dados.garantiaAte && !dados.fornecedorId) {
      contexto.addIssue({
        code: "custom",
        path: ["fornecedorId"],
        message: "Selecione o fornecedor responsável pela garantia",
      });
    }
  },
);

export const atualizarEquipamentoSchema = equipamentoBaseSchema
  .partial()
  .superRefine((dados, contexto) => {
    if (Object.keys(dados).length === 0) {
      contexto.addIssue({
        code: "custom",
        message: "Informe pelo menos um campo para atualizar",
      });

      return;
    }

    validarPeriodoGarantia(dados, contexto);
  });

export type CriarEquipamentoInput = z.infer<typeof criarEquipamentoSchema>;

export type AtualizarEquipamentoInput = z.infer<
  typeof atualizarEquipamentoSchema
>;
