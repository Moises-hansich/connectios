import { CheckCircle2, Eye, Wrench } from "lucide-react";

import type { Manutencao, StatusManutencao } from "../../types/manutencao";

interface ManutencaoTableProps {
  manutencoes: Manutencao[];
  onDetalhes: (manutencao: Manutencao) => void;
  onFinalizar?: (manutencao: Manutencao) => void;
}

function formatarData(valor: string | null) {
  if (!valor) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(valor));
}

function formatarCusto(custo: string | number | null) {
  if (custo === null || custo === undefined || custo === "") {
    return "Não informado";
  }

  const valor = Number(custo);

  if (Number.isNaN(valor)) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function textoStatus(status: StatusManutencao) {
  const textos: Record<StatusManutencao, string> = {
    EM_ANDAMENTO: "Em andamento",
    FINALIZADA: "Finalizada",
  };

  return textos[status];
}

function classeStatus(status: StatusManutencao) {
  const classes: Record<StatusManutencao, string> = {
    EM_ANDAMENTO: "bg-amber-100 text-amber-700",
    FINALIZADA: "bg-emerald-100 text-emerald-700",
  };

  return classes[status];
}

function empresaOuLocal(manutencao: Manutencao): string {
  return (
    manutencao.empresaResponsavel?.nome ||
    manutencao.empresaResponsavelTexto ||
    manutencao.localManutencao ||
    "Responsável não informado"
  );
}

function previsaoOuRetorno(manutencao: Manutencao) {
  if (manutencao.status === "FINALIZADA") {
    return formatarData(manutencao.dataRetorno);
  }

  return formatarData(manutencao.previsaoRetorno);
}

export function ManutencaoTable({
  manutencoes,
  onDetalhes,
  onFinalizar,
}: ManutencaoTableProps) {
  if (manutencoes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <Wrench size={42} className="mx-auto text-slate-300" />

        <p className="mt-4 font-medium text-slate-700">
          Nenhuma manutenção encontrada
        </p>

        <p className="mt-1 text-sm text-slate-500">
          As manutenções cadastradas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Visualização mobile */}
      <div className="space-y-4 lg:hidden">
        {manutencoes.map((manutencao) => (
          <article
            key={manutencao.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">
                  {manutencao.equipamento?.nome ??
                    `Equipamento #${manutencao.equipamentoId}`}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {manutencao.equipamento?.patrimonio || "Sem patrimônio"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${classeStatus(
                  manutencao.status,
                )}`}
              >
                {textoStatus(manutencao.status)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm min-[400px]:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Problema
                </p>

                <p className="mt-1 text-slate-700">
                  {manutencao.problemaInformado}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Empresa/Local
                </p>

                <p className="mt-1 text-slate-700">
                  {empresaOuLocal(manutencao)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Data de saída
                </p>

                <p className="mt-1 text-slate-700">
                  {formatarData(manutencao.dataSaida)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  {manutencao.status === "FINALIZADA"
                    ? "Data de retorno"
                    : "Previsão de retorno"}
                </p>

                <p className="mt-1 text-slate-700">
                  {previsaoOuRetorno(manutencao)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Custo
                </p>

                <p className="mt-1 text-slate-700">
                  {formatarCusto(manutencao.custo)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 min-[400px]:grid-cols-2">
              <button
                type="button"
                onClick={() => onDetalhes(manutencao)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
              >
                <Eye size={17} />
                Ver detalhes
              </button>

              {manutencao.status === "EM_ANDAMENTO" && onFinalizar && (
                <button
                  type="button"
                  onClick={() => onFinalizar(manutencao)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  <CheckCircle2 size={17} />
                  Finalizar
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Visualização desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Equipamento
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Problema
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Empresa/Local
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Saída
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Previsão/Retorno
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Custo
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {manutencoes.map((manutencao) => (
                <tr
                  key={manutencao.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {manutencao.equipamento?.nome ??
                        `Equipamento #${manutencao.equipamentoId}`}
                    </p>

                    <p className="text-xs text-slate-500">
                      {manutencao.equipamento?.patrimonio || "Sem patrimônio"}
                    </p>
                  </td>

                  <td className="max-w-xs px-4 py-3 text-sm text-slate-600">
                    <p className="truncate">{manutencao.problemaInformado}</p>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {empresaOuLocal(manutencao)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {formatarData(manutencao.dataSaida)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {previsaoOuRetorno(manutencao)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {formatarCusto(manutencao.custo)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${classeStatus(
                        manutencao.status,
                      )}`}
                    >
                      {textoStatus(manutencao.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onDetalhes(manutencao)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                        title="Ver detalhes da manutenção"
                      >
                        <Eye size={16} />
                        Detalhes
                      </button>

                      {manutencao.status === "EM_ANDAMENTO" && onFinalizar && (
                        <button
                          type="button"
                          onClick={() => onFinalizar(manutencao)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                          title="Finalizar manutenção"
                        >
                          <CheckCircle2 size={16} />
                          Finalizar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
