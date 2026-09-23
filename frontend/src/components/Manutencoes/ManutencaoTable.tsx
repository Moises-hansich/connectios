import { CheckCircle2, Eye, Wrench } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

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

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function formatarCusto(custo: string | number | null) {
  if (custo === null || custo === undefined || custo === "") {
    return "Não informado";
  }

  const valor = Number(custo);

  if (!Number.isFinite(valor)) {
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

function responsavelOuLocal(manutencao: Manutencao): string {
  if (manutencao.tipo === "INTERNA") {
    return (
      manutencao.tecnicoResponsavel?.nome ||
      manutencao.localManutencao ||
      "Técnico não informado"
    );
  }

  return (
    manutencao.empresaResponsavel?.nome ||
    manutencao.empresaResponsavelTexto ||
    manutencao.localManutencao ||
    "Responsável não informado"
  );
}

function textoTipo(manutencao: Manutencao) {
  if (manutencao.tipo === "INTERNA") {
    return "Interna";
  }

  if (manutencao.tipo === "EXTERNA") {
    return "Externa";
  }

  return "Tipo não informado";
}

function rotuloDataInicio(manutencao: Manutencao) {
  return manutencao.tipo === "INTERNA" ? "Data de início" : "Data de saída";
}

function rotuloPrevisaoOuRetorno(manutencao: Manutencao) {
  const interna = manutencao.tipo === "INTERNA";

  if (manutencao.status === "FINALIZADA") {
    return interna ? "Data de conclusão" : "Data de retorno";
  }

  return interna ? "Previsão de conclusão" : "Previsão de retorno";
}

function previsaoOuRetorno(manutencao: Manutencao) {
  return formatarData(
    manutencao.status === "FINALIZADA"
      ? manutencao.dataRetorno
      : manutencao.previsaoRetorno,
  );
}

export function ManutencaoTable({
  manutencoes,
  onDetalhes,
  onFinalizar,
}: ManutencaoTableProps) {
  const { temTodasPermissoes } = useAuth();

  const podeVisualizar = temTodasPermissoes("manutencoes.visualizar");

  const podeFinalizar = temTodasPermissoes(
    "manutencoes.visualizar",
    "manutencoes.finalizar",
  );

  function permiteFinalizacao(manutencao: Manutencao) {
    return (
      podeFinalizar &&
      typeof onFinalizar === "function" &&
      manutencao.status === "EM_ANDAMENTO"
    );
  }

  function abrirDetalhes(manutencao: Manutencao) {
    if (!podeVisualizar) return;

    onDetalhes(manutencao);
  }

  function finalizar(manutencao: Manutencao) {
    if (!permiteFinalizacao(manutencao)) return;

    onFinalizar?.(manutencao);
  }

  if (!podeVisualizar) {
    return null;
  }

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
        {manutencoes.map((manutencao) => {
          const exibirFinalizar = permiteFinalizacao(manutencao);

          return (
            <article
              key={manutencao.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-slate-800">
                    {manutencao.equipamento?.nome ??
                      `Equipamento #${manutencao.equipamentoId}`}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {manutencao.equipamento?.patrimonio || "Sem patrimônio"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {textoTipo(manutencao)}
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

                  <p className="mt-1 break-words text-slate-700">
                    {manutencao.problemaInformado}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    {manutencao.tipo === "INTERNA"
                      ? "Técnico/Local"
                      : "Empresa/Local"}
                  </p>

                  <p className="mt-1 break-words text-slate-700">
                    {responsavelOuLocal(manutencao)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    {rotuloDataInicio(manutencao)}
                  </p>

                  <p className="mt-1 text-slate-700">
                    {formatarData(manutencao.dataSaida)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    {rotuloPrevisaoOuRetorno(manutencao)}
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

              <div
                className={`mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 ${
                  exibirFinalizar ? "min-[400px]:grid-cols-2" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => abrirDetalhes(manutencao)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                >
                  <Eye size={17} />
                  Ver detalhes
                </button>

                {exibirFinalizar && (
                  <button
                    type="button"
                    onClick={() => finalizar(manutencao)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={17} />
                    Finalizar
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Visualização desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">
              Histórico de manutenções dos equipamentos
            </caption>

            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Equipamento
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Problema
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Responsável/Local
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Início/Saída
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Previsão/Conclusão
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Custo
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
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

                    <p className="mt-1 text-xs text-slate-500">
                      {textoTipo(manutencao)}
                    </p>
                  </td>

                  <td className="max-w-xs px-4 py-3 text-sm text-slate-600">
                    <p
                      className="truncate"
                      title={manutencao.problemaInformado}
                    >
                      {manutencao.problemaInformado}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {responsavelOuLocal(manutencao)}
                  </td>

                  <td
                    className="whitespace-nowrap px-4 py-3 text-sm text-slate-600"
                    title={rotuloDataInicio(manutencao)}
                  >
                    {formatarData(manutencao.dataSaida)}
                  </td>

                  <td
                    className="whitespace-nowrap px-4 py-3 text-sm text-slate-600"
                    title={rotuloPrevisaoOuRetorno(manutencao)}
                  >
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
                        onClick={() => abrirDetalhes(manutencao)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                        title="Ver detalhes da manutenção"
                      >
                        <Eye size={16} />
                        Detalhes
                      </button>

                      {permiteFinalizacao(manutencao) && (
                        <button
                          type="button"
                          onClick={() => finalizar(manutencao)}
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
