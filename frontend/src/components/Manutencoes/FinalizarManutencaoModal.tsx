import { type FormEvent, useRef, useState } from "react";
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

interface FormularioFinalizacaoProps {
  manutencao: Manutencao;
  onFechar: () => void;
  onSucesso?: (() => void | Promise<void>) | undefined;
}

interface ApiErrorResponse {
  mensagem?: string;
  message?: string;
}

const classeCampo =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

const classeLabel = "mb-1 block text-sm font-medium text-slate-700";

function formatarParaInputDataHora(data: Date | string): string {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "";
  }

  const diferencaFuso = dataConvertida.getTimezoneOffset() * 60_000;

  return new Date(dataConvertida.getTime() - diferencaFuso)
    .toISOString()
    .slice(0, 19);
}

function mensagemDoErro(error: unknown): string {
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
  if (!aberto || !manutencao) {
    return null;
  }

  return (
    <FormularioFinalizacao
      key={manutencao.id}
      manutencao={manutencao}
      onFechar={onFechar}
      onSucesso={onSucesso}
    />
  );
}

function FormularioFinalizacao({
  manutencao,
  onFechar,
  onSucesso,
}: FormularioFinalizacaoProps) {
  const [diagnostico, setDiagnostico] = useState(manutencao.diagnostico ?? "");
  const [solucao, setSolucao] = useState(manutencao.solucao ?? "");
  const [custo, setCusto] = useState(String(manutencao.custo ?? ""));
  const [observacoes, setObservacoes] = useState(manutencao.observacoes ?? "");
  const [dataRetorno, setDataRetorno] = useState(() =>
    formatarParaInputDataHora(new Date()),
  );
  const [salvando, setSalvando] = useState(false);

  const envioEmAndamento = useRef(false);
  const finalizadaRef = useRef(false);

  const interna = manutencao.tipo === "INTERNA";
  const emAndamento = manutencao.status === "EM_ANDAMENTO";
  const desabilitado = salvando || !emAndamento;

  const tituloData = interna ? "Data de conclusão" : "Data de retorno";

  // Arredonda o mínimo para o próximo segundo quando a abertura
  // possui milissegundos, preservando a comparação com o backend.
  const saidaTimestamp = new Date(manutencao.dataSaida).getTime();

  const dataMinima = Number.isFinite(saidaTimestamp)
    ? formatarParaInputDataHora(
        new Date(Math.ceil(saidaTimestamp / 1000) * 1000),
      )
    : undefined;

  function fechar() {
    if (!envioEmAndamento.current) {
      onFechar();
    }
  }

  async function finalizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (envioEmAndamento.current || finalizadaRef.current) {
      return;
    }

    if (!emAndamento) {
      toast.error("Esta manutenção já foi finalizada.");
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
      toast.error(
        interna ? "Informe a data de conclusão." : "Informe a data de retorno.",
      );
      return;
    }

    const retorno = new Date(dataRetorno);

    if (Number.isNaN(retorno.getTime())) {
      toast.error(
        interna
          ? "A data de conclusão é inválida."
          : "A data de retorno é inválida.",
      );
      return;
    }

    if (!Number.isFinite(saidaTimestamp)) {
      toast.error(
        "A data de início da manutenção é inválida. Confira o cadastro.",
      );
      return;
    }

    if (retorno.getTime() < saidaTimestamp) {
      toast.error(
        interna
          ? "A conclusão não pode ser anterior ao início do atendimento."
          : "A data de retorno não pode ser anterior à data de saída.",
      );
      return;
    }

    let custoConvertido: number | undefined;

    if (custo.trim()) {
      custoConvertido = Number(custo.trim().replace(",", "."));

      if (!Number.isFinite(custoConvertido) || custoConvertido < 0) {
        toast.error("Informe um custo válido.");
        return;
      }
    }

    envioEmAndamento.current = true;
    setSalvando(true);

    try {
      const resultado = await manutencaoService.finalizar(manutencao.id, {
        diagnostico: diagnosticoLimpo || null,
        solucao: solucaoLimpa,
        ...(custoConvertido !== undefined ? { custo: custoConvertido } : {}),
        observacoes: observacoes.trim() || null,

        // A API utiliza dataRetorno para ambos os tipos.
        dataRetorno: retorno.toISOString(),
      });

      finalizadaRef.current = true;

      toast.success(resultado.mensagem || "Manutenção finalizada com sucesso.");
    } catch (error) {
      console.error("Erro ao finalizar manutenção:", error);
      toast.error(mensagemDoErro(error));

      envioEmAndamento.current = false;
      setSalvando(false);
      return;
    }

    try {
      await onSucesso?.();
    } catch (error) {
      console.error("Erro ao atualizar a listagem:", error);

      toast.warning(
        "A manutenção foi finalizada, mas a listagem não foi atualizada. Atualize a página.",
      );
    } finally {
      envioEmAndamento.current = false;
      onFechar();
    }
  }

  return (
    <Modal aberto titulo="Finalizar manutenção" onClose={fechar}>
      <form className="space-y-5" onSubmit={finalizar}>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Equipamento
          </p>

          <p className="mt-1 break-words font-semibold text-slate-900">
            {manutencao.equipamento.nome}
          </p>

          <p className="text-sm text-slate-500">
            {manutencao.equipamento.patrimonio || "Sem patrimônio"}
          </p>

          <p className="mt-2 text-sm font-medium text-slate-600">
            {interna
              ? "Manutenção interna — equipe de TI"
              : "Manutenção externa — assistência técnica"}
          </p>

          {interna && (
            <p className="mt-1 text-sm text-slate-600">
              Técnico responsável:{" "}
              {manutencao.tecnicoResponsavel?.nome || "Não informado"}
            </p>
          )}

          <div className="mt-3 border-t border-slate-200 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Problema informado
            </p>

            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
              {manutencao.problemaInformado}
            </p>
          </div>
        </div>

        {!emAndamento && (
          <p
            role="status"
            className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
          >
            Esta manutenção já foi finalizada.
          </p>
        )}

        <div>
          <label htmlFor="diagnostico" className={classeLabel}>
            Diagnóstico
          </label>

          <textarea
            id="diagnostico"
            value={diagnostico}
            onChange={(event) => setDiagnostico(event.target.value)}
            rows={3}
            disabled={desabilitado}
            placeholder="Descreva o diagnóstico encontrado"
            className={`${classeCampo} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="solucao" className={classeLabel}>
            Solução <span className="text-red-500">*</span>
          </label>

          <textarea
            id="solucao"
            value={solucao}
            onChange={(event) => setSolucao(event.target.value)}
            rows={3}
            minLength={3}
            required
            disabled={desabilitado}
            placeholder="Descreva o serviço realizado"
            className={`${classeCampo} resize-y`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dataRetorno" className={classeLabel}>
              {tituloData} <span className="text-red-500">*</span>
            </label>

            <input
              id="dataRetorno"
              type="datetime-local"
              step="1"
              value={dataRetorno}
              min={dataMinima}
              onChange={(event) => setDataRetorno(event.target.value)}
              required
              disabled={desabilitado}
              className={classeCampo}
            />
          </div>

          <div>
            <label htmlFor="custoFinal" className={classeLabel}>
              Custo final (R$)
            </label>

            <input
              id="custoFinal"
              type="text"
              inputMode="decimal"
              value={custo}
              onChange={(event) => setCusto(event.target.value)}
              disabled={desabilitado}
              placeholder="0,00"
              className={classeCampo}
            />

            <p className="mt-1 text-xs text-slate-500">
              Deixe vazio para manter o custo registrado. Informe 0 se não houve
              custo.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="observacoesFinalizacao" className={classeLabel}>
            Observações
          </label>

          <textarea
            id="observacoesFinalizacao"
            value={observacoes}
            onChange={(event) => setObservacoes(event.target.value)}
            rows={3}
            disabled={desabilitado}
            placeholder="Informações adicionais sobre a manutenção"
            className={`${classeCampo} resize-y`}
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
            disabled={desabilitado}
            className="w-full sm:w-auto"
          >
            <CheckCircle2 size={18} />
            <span>{salvando ? "Finalizando..." : "Finalizar manutenção"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
