import { type FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../Button";
import { Modal } from "../Modal";
import { manutencaoService } from "../../services/manutencaoService";

import type { Manutencao } from "../../types/manutencao";

interface FinalizarManutencaoModalProps {
  aberto: boolean;
  manutencao: Manutencao | null;
  onFechar: () => void;
  onSucesso?: () => void | Promise<void>;
}

interface ApiErrorResponse {
  mensagem?: string;
  message?: string;
}

function formatarParaInputDataHora(data: Date | string) {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "";
  }

  const diferencaFuso = dataConvertida.getTimezoneOffset() * 60_000;

  return new Date(dataConvertida.getTime() - diferencaFuso)
    .toISOString()
    .slice(0, 16);
}

function mensagemDoErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.mensagem ??
      error.response?.data?.message ??
      "Não foi possível finalizar a manutenção."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível finalizar a manutenção.";
}

export function FinalizarManutencaoModal({
  aberto,
  manutencao,
  onFechar,
  onSucesso,
}: FinalizarManutencaoModalProps) {
  const [diagnostico, setDiagnostico] = useState("");
  const [solucao, setSolucao] = useState("");
  const [custo, setCusto] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [dataRetorno, setDataRetorno] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto || !manutencao) {
      return;
    }

    setDiagnostico(manutencao.diagnostico ?? "");
    setSolucao(manutencao.solucao ?? "");
    setCusto(manutencao.custo ?? "");
    setObservacoes(manutencao.observacoes ?? "");
    setDataRetorno(formatarParaInputDataHora(new Date()));
    setSalvando(false);
  }, [aberto, manutencao]);

  async function finalizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!manutencao) {
      return;
    }

    const solucaoLimpa = solucao.trim();
    const diagnosticoLimpo = diagnostico.trim();

    if (solucaoLimpa.length < 3) {
      toast.error("A solução deve possuir pelo menos 3 caracteres.");
      return;
    }

    if (diagnosticoLimpo && diagnosticoLimpo.length < 3) {
      toast.error("O diagnóstico deve possuir pelo menos 3 caracteres.");
      return;
    }

    if (!dataRetorno) {
      toast.error("Informe a data de retorno.");
      return;
    }

    const retorno = new Date(dataRetorno);
    const saida = new Date(manutencao.dataSaida);

    if (Number.isNaN(retorno.getTime())) {
      toast.error("A data de retorno é inválida.");
      return;
    }

    if (!Number.isNaN(saida.getTime()) && retorno < saida) {
      toast.error("A data de retorno não pode ser anterior à data de saída.");
      return;
    }

    let custoConvertido: number | undefined;

    if (custo.trim()) {
      custoConvertido = Number(custo.replace(",", "."));

      if (!Number.isFinite(custoConvertido) || custoConvertido < 0) {
        toast.error("Informe um custo válido.");
        return;
      }
    }

    try {
      setSalvando(true);

      const resultado = await manutencaoService.finalizar(manutencao.id, {
        diagnostico: diagnosticoLimpo || null,

        solucao: solucaoLimpa,

        custo: custoConvertido,

        observacoes: observacoes.trim() || null,

        dataRetorno: retorno.toISOString(),
      });

      toast.success(resultado.mensagem || "Manutenção finalizada com sucesso.");

      await onSucesso?.();
      onFechar();
    } catch (error) {
      console.error("Erro ao finalizar manutenção:", error);

      toast.error(mensagemDoErro(error));
    } finally {
      setSalvando(false);
    }
  }

  function fechar() {
    if (!salvando) {
      onFechar();
    }
  }

  return (
    <Modal aberto={aberto} titulo="Finalizar manutenção" onClose={fechar}>
      {manutencao && (
        <form className="space-y-5" onSubmit={finalizar}>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Equipamento
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {manutencao.equipamento.nome}
            </p>

            <p className="text-sm text-slate-500">
              {manutencao.equipamento.patrimonio || "Sem patrimônio"}
            </p>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Problema informado
              </p>

              <p className="mt-1 break-words text-sm text-slate-700">
                {manutencao.problemaInformado}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="diagnostico"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Diagnóstico
            </label>

            <textarea
              id="diagnostico"
              value={diagnostico}
              onChange={(event) => setDiagnostico(event.target.value)}
              rows={3}
              disabled={salvando}
              placeholder="Descreva o diagnóstico encontrado"
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="solucao"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Solução <span className="text-red-500">*</span>
            </label>

            <textarea
              id="solucao"
              value={solucao}
              onChange={(event) => setSolucao(event.target.value)}
              rows={3}
              minLength={3}
              required
              disabled={salvando}
              placeholder="Descreva o serviço realizado"
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="dataRetorno"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Data de retorno <span className="text-red-500">*</span>
              </label>

              <input
                id="dataRetorno"
                type="datetime-local"
                value={dataRetorno}
                min={formatarParaInputDataHora(manutencao.dataSaida)}
                onChange={(event) => setDataRetorno(event.target.value)}
                required
                disabled={salvando}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="custoFinal"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Custo final (R$)
              </label>

              <input
                id="custoFinal"
                type="text"
                inputMode="decimal"
                value={custo}
                onChange={(event) => setCusto(event.target.value)}
                disabled={salvando}
                placeholder="0,00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="observacoesFinalizacao"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Observações
            </label>

            <textarea
              id="observacoesFinalizacao"
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              rows={3}
              disabled={salvando}
              placeholder="Informações adicionais sobre a manutenção"
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={fechar}
              disabled={salvando}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              loading={salvando}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 size={18} />
              Finalizar manutenção
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
