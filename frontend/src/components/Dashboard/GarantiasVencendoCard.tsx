import {
  Building2,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import type { DashboardData } from "../../types/dashboard";

interface GarantiasVencendoCardProps {
  dados: DashboardData["garantias"];
}

function formatarData(valor: string): string {
  const dataSomente = valor.slice(0, 10);
  const [ano, mes, dia] = dataSomente.split("-");

  if (!ano || !mes || !dia) {
    return "Data inválida";
  }

  return `${dia}/${mes}/${ano}`;
}

function textoDias(diasRestantes: number): string {
  if (diasRestantes === 0) {
    return "Vence hoje";
  }

  if (diasRestantes === 1) {
    return "Vence amanhã";
  }

  return `Vence em ${diasRestantes} dias`;
}

function classePrazo(diasRestantes: number): string {
  if (diasRestantes <= 7) {
    return "bg-red-100 text-red-700";
  }

  if (diasRestantes <= 15) {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-amber-100 text-amber-700";
}

export function GarantiasVencendoCard({ dados }: GarantiasVencendoCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
            <ShieldAlert size={23} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Garantias vencendo</h2>

            <p className="mt-1 text-sm text-slate-500">
              Equipamentos com garantia vencendo nos próximos {dados.diasAviso}{" "}
              dias.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
          {dados.total}
        </span>
      </div>

      {dados.itens.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <ShieldCheck size={36} className="text-emerald-500" />

          <p className="mt-3 font-medium text-slate-800">
            Nenhuma garantia próxima do vencimento
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Não existem equipamentos com garantia vencendo nesse período.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {dados.itens.map((equipamento) => (
            <article
              key={equipamento.id}
              className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {equipamento.nome}
                  </h3>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${classePrazo(
                      equipamento.diasRestantes,
                    )}`}
                  >
                    {textoDias(equipamento.diasRestantes)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {equipamento.categoria.nome}

                  {equipamento.patrimonio
                    ? ` • Patrimônio ${equipamento.patrimonio}`
                    : ""}
                </p>

                <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-600 sm:flex-row sm:gap-5">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={16} />
                    Garantia até {formatarData(equipamento.garantiaAte)}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Building2 size={16} />

                    {equipamento.fornecedor?.nome ??
                      "Fornecedor não cadastrado"}
                  </span>
                </div>
              </div>

              {!equipamento.fornecedor && (
                <span className="text-sm font-medium text-red-600">
                  Cadastre o fornecedor antes do vencimento.
                </span>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
