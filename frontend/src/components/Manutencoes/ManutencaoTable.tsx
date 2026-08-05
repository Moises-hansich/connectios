import { CheckCircle2, Wrench } from "lucide-react";

import type { Manutencao, StatusManutencao } from "../../types/manutencao";

interface ManutencaoTableProps {
  manutencoes: Manutencao[];
  onFinalizar?: (manutencao: Manutencao) => void;
}

function formatarData(valor: string | null): string {
  if (!valor) {
    return "Não informado";
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

function formatarCusto(custo: string | number | null): string {
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

function textoStatus(status: StatusManutencao): string {
  const textos: Record<StatusManutencao, string> = {
    EM_ANDAMENTO: "Em andamento",
    FINALIZADA: "Finalizada",
  };

  return textos[status];
}

function classeStatus(status: StatusManutencao): string {
  if (status === "FINALIZADA") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-amber-100 text-amber-700";
}

function empresaOuLocal(manutencao: Manutencao): string {
  return (
    manutencao.empresaResponsavel?.nome ||
    manutencao.empresaResponsavelTexto ||
    manutencao.localManutencao ||
    "Responsável não informado"
  );
}

function previsaoOuRetorno(manutencao: Manutencao): string {
  if (manutencao.status === "FINALIZADA") {
    return `Retorno: ${formatarData(manutencao.dataRetorno)}`;
  }

  return `Previsão: ${formatarData(manutencao.previsaoRetorno)}`;
}

export function ManutencaoTable({
  manutencoes,
  onFinalizar,
}: ManutencaoTableProps) {
  if (manutencoes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <Wrench size={36} className="mx-auto text-slate-400" />

        <h3 className="mt-3 font-semibold text-slate-800">
          Nenhuma manutenção encontrada
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          As manutenções cadastradas serão exibidas aqui.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {manutencoes.map((manutencao) => (
          <article
            key={manutencao.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {manutencao.equipamento.nome}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {manutencao.equipamento.patrimonio || "Sem patrimônio"}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${classeStatus(
                  manutencao.status,
                )}`}
              >
                {textoStatus(manutencao.status)}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-medium text-slate-700">Problema:</span>{" "}
                <span className="text-slate-600">
                  {manutencao.problemaInformado}
                </span>
              </p>

              <p>
                <span className="font-medium text-slate-700">
                  Empresa/local:
                </span>{" "}
                <span className="text-slate-600">
                  {empresaOuLocal(manutencao)}
                </span>
              </p>

              <p className="text-slate-600">
                Saída: {formatarData(manutencao.dataSaida)}
              </p>

              <p className="text-slate-600">{previsaoOuRetorno(manutencao)}</p>

              <p className="text-slate-600">
                Custo: {formatarCusto(manutencao.custo)}
              </p>
            </div>

            {manutencao.status === "EM_ANDAMENTO" && onFinalizar && (
              <button
                type="button"
                onClick={() => onFinalizar(manutencao)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <CheckCircle2 size={17} />
                Finalizar manutenção
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Equipamento</th>

                <th className="px-4 py-3">Problema</th>

                <th className="px-4 py-3">Empresa/local</th>

                <th className="px-4 py-3">Saída</th>

                <th className="px-4 py-3">Previsão/retorno</th>

                <th className="px-4 py-3">Custo</th>

                <th className="px-4 py-3">Status</th>

                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {manutencoes.map((manutencao) => (
                <tr key={manutencao.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {manutencao.equipamento.nome}
                    </p>

                    <p className="text-xs text-slate-500">
                      {manutencao.equipamento.patrimonio || "Sem patrimônio"}
                    </p>
                  </td>

                  <td className="max-w-[240px] px-4 py-3 text-sm text-slate-600">
                    <p className="truncate">{manutencao.problemaInformado}</p>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {empresaOuLocal(manutencao)}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatarData(manutencao.dataSaida)}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {previsaoOuRetorno(manutencao)}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatarCusto(manutencao.custo)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classeStatus(
                        manutencao.status,
                      )}`}
                    >
                      {textoStatus(manutencao.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {manutencao.status === "EM_ANDAMENTO" && onFinalizar ? (
                      <button
                        type="button"
                        onClick={() => onFinalizar(manutencao)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <CheckCircle2 size={16} />
                        Finalizar
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
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
