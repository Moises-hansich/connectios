import { CheckCircle2, Eye, Wrench } from "lucide-react";

import type { Manutencao, StatusManutencao } from "../../types/manutencao";

interface ManutencaoTableProps {
  manutencoes: Manutencao[];
  onVerDetalhes?: (manutencao: Manutencao) => void;
  onFinalizar?: (manutencao: Manutencao) => void;
}

function formatarData(data: string | null) {
  if (!data) {
    return "Não informado";
  }

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Data inválida";
  }

  return dataFormatada.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatarCusto(custo: string | null) {
  if (custo === null) {
    return "Não informado";
  }

  const valor = Number(custo);

  if (!Number.isFinite(valor)) {
    return "Valor inválido";
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function textoStatus(status: StatusManutencao) {
  return status === "EM_ANDAMENTO" ? "Em andamento" : "Finalizada";
}

function classeStatus(status: StatusManutencao) {
  if (status === "EM_ANDAMENTO") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

function previsaoOuRetorno(manutencao: Manutencao) {
  return manutencao.dataRetorno ?? manutencao.previsaoRetorno;
}

export function ManutencaoTable({
  manutencoes,
  onVerDetalhes,
  onFinalizar,
}: ManutencaoTableProps) {
  if (manutencoes.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <Wrench size={42} className="mx-auto mb-3 text-slate-300" />

        <h3 className="font-semibold text-slate-700">
          Nenhuma manutenção encontrada
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Altere os filtros ou registre uma nova manutenção.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Visualização para celular */}
      <div className="space-y-4 p-4 md:hidden">
        {manutencoes.map((manutencao) => (
          <article
            key={manutencao.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-900">
                  {manutencao.equipamento.nome}
                </h3>

                <p className="text-xs text-slate-500">
                  {manutencao.equipamento.patrimonio || "Sem patrimônio"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${classeStatus(
                  manutencao.status,
                )}`}
              >
                {textoStatus(manutencao.status)}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-medium text-slate-700">Problema informado</p>

                <p className="break-words text-slate-600">
                  {manutencao.problemaInformado}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {manutencao.empresaResponsavel ||
                    manutencao.localManutencao ||
                    "Responsável não informado"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-slate-700">Saída</p>
                  <p className="text-slate-600">
                    {formatarData(manutencao.dataSaida)}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-700">
                    {manutencao.dataRetorno ? "Retorno" : "Previsão"}
                  </p>
                  <p className="text-slate-600">
                    {formatarData(previsaoOuRetorno(manutencao))}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-700">Custo</p>
                <p className="text-slate-600">
                  {formatarCusto(manutencao.custo)}
                </p>
              </div>
            </div>

            {(onVerDetalhes ||
              (manutencao.status === "EM_ANDAMENTO" && onFinalizar)) && (
              <div
                className={`mt-4 grid gap-2 border-t border-slate-100 pt-4 ${
                  onVerDetalhes &&
                  manutencao.status === "EM_ANDAMENTO" &&
                  onFinalizar
                    ? "grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {onVerDetalhes && (
                  <button
                    type="button"
                    onClick={() => onVerDetalhes(manutencao)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    aria-label={`Ver detalhes da manutenção de ${manutencao.equipamento.nome}`}
                  >
                    <Eye size={18} />
                    Detalhes
                  </button>
                )}

                {manutencao.status === "EM_ANDAMENTO" && onFinalizar && (
                  <button
                    type="button"
                    onClick={() => onFinalizar(manutencao)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    aria-label={`Finalizar manutenção de ${manutencao.equipamento.nome}`}
                  >
                    <CheckCircle2 size={18} />
                    Finalizar
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Visualização para computador */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1080px]">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Equipamento</th>
              <th className="px-5 py-3">Problema</th>
              <th className="px-5 py-3">Saída</th>
              <th className="px-5 py-3">Previsão/retorno</th>
              <th className="px-5 py-3">Custo</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {manutencoes.map((manutencao) => (
              <tr
                key={manutencao.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">
                    {manutencao.equipamento.nome}
                  </p>

                  <p className="text-xs text-slate-500">
                    {manutencao.equipamento.patrimonio || "Sem patrimônio"}
                  </p>
                </td>

                <td className="max-w-xs px-5 py-4">
                  <p
                    className="truncate text-sm text-slate-700"
                    title={manutencao.problemaInformado}
                  >
                    {manutencao.problemaInformado}
                  </p>

                  <p className="text-xs text-slate-500">
                    {manutencao.empresaResponsavel ||
                      manutencao.localManutencao ||
                      "Responsável não informado"}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatarData(manutencao.dataSaida)}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatarData(previsaoOuRetorno(manutencao))}
                </td>

                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                  {formatarCusto(manutencao.custo)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classeStatus(
                      manutencao.status,
                    )}`}
                  >
                    {textoStatus(manutencao.status)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {onVerDetalhes && (
                      <button
                        type="button"
                        onClick={() => onVerDetalhes(manutencao)}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        aria-label={`Ver detalhes da manutenção de ${manutencao.equipamento.nome}`}
                        title="Ver detalhes"
                      >
                        <Eye size={18} />
                        Detalhes
                      </button>
                    )}

                    {manutencao.status === "EM_ANDAMENTO" && onFinalizar && (
                      <button
                        type="button"
                        onClick={() => onFinalizar(manutencao)}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        aria-label={`Finalizar manutenção de ${manutencao.equipamento.nome}`}
                        title="Finalizar manutenção"
                      >
                        <CheckCircle2 size={18} />
                        Finalizar
                      </button>
                    )}

                    {!onVerDetalhes &&
                      !(
                        manutencao.status === "EM_ANDAMENTO" && onFinalizar
                      ) && (
                        <span className="text-sm text-slate-400">
                          Sem ações
                        </span>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
