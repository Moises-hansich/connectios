import { Building2, Mail, Pencil, Phone, Power, Trash2 } from "lucide-react";

import type { Empresa } from "../../types/empresa";
import { formatarTelefone } from "../../utils/telefone";
interface EmpresaTableProps {
  empresas: Empresa[];
  carregando: boolean;
  alterandoId: number | null;
  excluindoId: number | null;
  onEditar: (empresa: Empresa) => void;
  onAlterarStatus: (empresa: Empresa) => void | Promise<void>;
  onExcluir: (empresa: Empresa) => void | Promise<void>;
}

function quantidadeVinculos(empresa: Empresa): number {
  return (
    (empresa._count?.equipamentosFornecidos ?? 0) +
    (empresa._count?.manutencoesRealizadas ?? 0)
  );
}

export function EmpresaTable({
  empresas,
  carregando,
  alterandoId,
  excluindoId,
  onEditar,
  onAlterarStatus,
  onExcluir,
}: EmpresaTableProps) {
  if (carregando) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 p-5">
          {Array.from({ length: 5 }).map((_, indice) => (
            <div
              key={indice}
              className="h-16 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (empresas.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <div className="rounded-full bg-slate-100 p-4 text-slate-500">
          <Building2 size={34} />
        </div>

        <h2 className="mt-4 font-semibold text-slate-800">
          Nenhuma empresa encontrada
        </h2>

        <p className="mt-1 max-w-md text-sm text-slate-500">
          Cadastre uma empresa para vinculá-la como fornecedora dos equipamentos
          e responsável pelas manutenções.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Empresa
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contato
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vínculos
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {empresas.map((empresa) => {
              const processando =
                alterandoId === empresa.id || excluindoId === empresa.id;

              return (
                <tr key={empresa.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{empresa.nome}</p>

                    <p className="mt-1 text-sm text-slate-500">
                      {empresa.cnpj || "CNPJ não informado"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {empresa.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail size={15} />
                        {empresa.email}
                      </p>
                    )}

                    {empresa.telefone && (
                      <p className="mt-1 flex items-center gap-1.5">
                        <Phone size={15} />
                        {formatarTelefone(empresa.telefone)}
                      </p>
                    )}

                    {!empresa.email && !empresa.telefone && (
                      <span className="text-slate-400">Não informado</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {quantidadeVinculos(empresa)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        empresa.ativo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {empresa.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        disabled={processando}
                        onClick={() => onEditar(empresa)}
                        title="Editar"
                        aria-label={`Editar ${empresa.nome}`}
                        className="rounded-lg p-2 text-slate-800 transition hover:bg-blue-50 disabled:opacity-50"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        disabled={processando}
                        onClick={() => void onAlterarStatus(empresa)}
                        title={empresa.ativo ? "Desativar" : "Ativar"}
                        aria-label={
                          empresa.ativo
                            ? `Desativar ${empresa.nome}`
                            : `Ativar ${empresa.nome}`
                        }
                        className={`rounded-lg p-2 transition disabled:opacity-50 ${
                          empresa.ativo
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        <Power size={18} />
                      </button>

                      <button
                        type="button"
                        disabled={processando}
                        onClick={() => void onExcluir(empresa)}
                        title="Excluir"
                        aria-label={`Excluir ${empresa.nome}`}
                        className="rounded-lg p-2 text-slate-800 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-200 md:hidden">
        {empresas.map((empresa) => {
          const processando =
            alterandoId === empresa.id || excluindoId === empresa.id;

          return (
            <article key={empresa.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{empresa.nome}</p>

                  <p className="mt-1 text-sm text-slate-500">
                    {empresa.cnpj || "CNPJ não informado"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    empresa.ativo
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {empresa.ativo ? "Ativa" : "Inativa"}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-600">
                {empresa.email && (
                  <p className="flex items-center gap-2 break-all">
                    <Mail size={15} />
                    {empresa.email}
                  </p>
                )}

                {empresa.telefone && (
                  <p className="flex items-center gap-2">
                    <Phone size={15} />
                    {empresa.telefone}
                  </p>
                )}

                <p>Vínculos: {quantidadeVinculos(empresa)}</p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={processando}
                  onClick={() => onEditar(empresa)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-slate-800 disabled:opacity-50"
                >
                  <Pencil size={16} />
                  Editar
                </button>

                <button
                  type="button"
                  disabled={processando}
                  onClick={() => void onAlterarStatus(empresa)}
                  className="rounded-lg bg-amber-50 p-2 text-amber-700 disabled:opacity-50"
                  aria-label={empresa.ativo ? "Desativar" : "Ativar"}
                >
                  <Power size={17} />
                </button>

                <button
                  type="button"
                  disabled={processando}
                  onClick={() => void onExcluir(empresa)}
                  className="rounded-lg bg-red-50 p-2 text-slate-800 disabled:opacity-50"
                  aria-label="Excluir"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
