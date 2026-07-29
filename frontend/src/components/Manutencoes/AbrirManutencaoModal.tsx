import { type FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { Wrench, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../Button";
import { manutencaoService } from "../../services/manutencaoService";

interface EquipamentoSelecionado {
  id: number;
  nome: string;
  patrimonio?: string | null;
}

interface AbrirManutencaoModalProps {
  aberto: boolean;
  equipamento: EquipamentoSelecionado | null;
  onFechar: () => void;
  onSucesso?: () => void | Promise<void>;
}

interface FormularioManutencao {
  problemaInformado: string;
  localManutencao: string;
  empresaResponsavel: string;
  previsaoRetorno: string;
  custo: string;
  observacoes: string;
}

const formularioInicial: FormularioManutencao = {
  problemaInformado: "",
  localManutencao: "",
  empresaResponsavel: "",
  previsaoRetorno: "",
  custo: "",
  observacoes: "",
};

export function AbrirManutencaoModal({
  aberto,
  equipamento,
  onFechar,
  onSucesso,
}: AbrirManutencaoModalProps) {
  const [formulario, setFormulario] =
    useState<FormularioManutencao>(formularioInicial);

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (aberto) {
      setFormulario(formularioInicial);
    }
  }, [aberto, equipamento?.id]);

  useEffect(() => {
    if (!aberto) {
      return;
    }

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !salvando) {
        onFechar();
      }
    }

    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [aberto, onFechar, salvando]);

  if (!aberto || !equipamento) {
    return null;
  }

  function alterarCampo(campo: keyof FormularioManutencao, valor: string) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const problema = formulario.problemaInformado.trim();

    if (!problema) {
      toast.error("Informe o problema apresentado pelo equipamento.");

      return;
    }

    const custo = formulario.custo === "" ? null : Number(formulario.custo);

    if (custo !== null && (!Number.isFinite(custo) || custo < 0)) {
      toast.error("Informe um custo válido.");

      return;
    }

    try {
      setSalvando(true);

      await manutencaoService.abrir({
        equipamentoId: equipamento.id,
        problemaInformado: problema,

        localManutencao: formulario.localManutencao.trim() || null,

        empresaResponsavel: formulario.empresaResponsavel.trim() || null,

        previsaoRetorno: formulario.previsaoRetorno || null,

        custo,

        observacoes: formulario.observacoes.trim() || null,
      });

      toast.success("Equipamento enviado para manutenção.");

      await onSucesso?.();
      onFechar();
    } catch (error) {
      console.error("Erro ao abrir manutenção:", error);

      let mensagem = "Não foi possível abrir a manutenção.";

      if (axios.isAxiosError(error)) {
        const dados = error.response?.data as
          | {
              mensagem?: string;
              message?: string;
            }
          | undefined;

        mensagem = dados?.mensagem ?? dados?.message ?? mensagem;
      }

      toast.error(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !salvando) {
          onFechar();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-manutencao"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3 text-amber-700">
              <Wrench size={22} />
            </div>

            <div>
              <h2
                id="titulo-manutencao"
                className="text-lg font-semibold text-slate-900"
              >
                Abrir manutenção
              </h2>

              <p className="text-sm text-slate-500">
                {equipamento.nome}
                {equipamento.patrimonio ? ` • ${equipamento.patrimonio}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Fechar"
            disabled={salvando}
            onClick={onFechar}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={enviarFormulario}>
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="problemaInformado"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Problema informado *
              </label>

              <textarea
                id="problemaInformado"
                rows={3}
                required
                autoFocus
                disabled={salvando}
                value={formulario.problemaInformado}
                onChange={(event) =>
                  alterarCampo("problemaInformado", event.target.value)
                }
                placeholder="Descreva o problema apresentado"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="localManutencao"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Local da manutenção
              </label>

              <input
                id="localManutencao"
                type="text"
                disabled={salvando}
                value={formulario.localManutencao}
                onChange={(event) =>
                  alterarCampo("localManutencao", event.target.value)
                }
                placeholder="Ex.: Assistência técnica"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="empresaResponsavel"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Empresa responsável
              </label>

              <input
                id="empresaResponsavel"
                type="text"
                disabled={salvando}
                value={formulario.empresaResponsavel}
                onChange={(event) =>
                  alterarCampo("empresaResponsavel", event.target.value)
                }
                placeholder="Nome da empresa ou técnico"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="previsaoRetorno"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Previsão de retorno
              </label>

              <input
                id="previsaoRetorno"
                type="datetime-local"
                disabled={salvando}
                value={formulario.previsaoRetorno}
                onChange={(event) =>
                  alterarCampo("previsaoRetorno", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="custo"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Custo previsto
              </label>

              <input
                id="custo"
                type="number"
                min="0"
                step="0.01"
                disabled={salvando}
                value={formulario.custo}
                onChange={(event) => alterarCampo("custo", event.target.value)}
                placeholder="0,00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="observacoes"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Observações
              </label>

              <textarea
                id="observacoes"
                rows={3}
                disabled={salvando}
                value={formulario.observacoes}
                onChange={(event) =>
                  alterarCampo("observacoes", event.target.value)
                }
                placeholder="Informações adicionais"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-5">
            <Button
              type="button"
              variant="secondary"
              disabled={salvando}
              onClick={onFechar}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={salvando}>
              <Wrench size={18} />

              {salvando ? "Enviando..." : "Abrir manutenção"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
