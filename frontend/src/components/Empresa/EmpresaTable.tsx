import { Building2, Mail, Pencil, Phone, Power, Trash2 } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import type { Empresa } from "../../types/empresa";
import { formatarTelefone } from "../../utils/telefone";

interface EmpresaTableProps {
  empresas: Empresa[];
  carregando: boolean;
  alterandoId: number | null;
  excluindoId: number | null;
  onEditar?: (empresa: Empresa) => void;
  onAlterarStatus?: (empresa: Empresa) => void | Promise<void>;
  onExcluir?: (empresa: Empresa) => void | Promise<void>;
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
  const {
    autenticado,
    carregando: carregandoAuth,
    carregandoPermissoes,
    erroPermissoes,
    temPermissao,
    temTodasPermissoes,
  } = useAuth();

  if (
    carregandoAuth ||
    carregandoPermissoes ||
    erroPermissoes ||
    !autenticado ||
    !temPermissao("empresas.visualizar")
  ) {
    return null;
  }

  const podeEditar =
    Boolean(onEditar) &&
    temTodasPermissoes("empresas.visualizar", "empresas.editar");

  const podeAlterarStatus =
    Boolean(onAlterarStatus) &&
    temTodasPermissoes("empresas.visualizar", "empresas.editar");

  const podeExcluir =
    Boolean(onExcluir) &&
    temTodasPermissoes("empresas.visualizar", "empresas.excluir");

  const possuiAcoes = podeEditar || podeAlterarStatus || podeExcluir;
  const processando = alterandoId !== null || excluindoId !== null;

  function renderizarAcoes(empresa: Empresa, mobile = false) {
    if (!possuiAcoes) {
      return null;
    }

    const alterandoEstaEmpresa = alterandoId === empresa.id;
    const excluindoEstaEmpresa = excluindoId === empresa.id;

    return (
      <div
        className={`flex flex-wrap justify-end gap-2 ${
          mobile ? "mt-4 border-t border-slate-100 pt-3" : ""
        }`}
      >
        {podeEditar && (
          <button
            type="button"
            disabled={processando}
            onClick={() => onEditar?.(empresa)}
            title="Editar"
            aria-label={`Editar ${empresa.nome}`}
            className="inline-flex items-center gap-1.5 rounded-lg p-2 text-slate-800 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil size={18} />
            {mobile && <span className="text-sm font-medium">Editar</span>}
          </button>
        )}

        {podeAlterarStatus && (
          <button
            type="button"
            disabled={processando}
            onClick={() => void onAlterarStatus?.(empresa)}
            title={
              alterandoEstaEmpresa
                ? "Alterando status..."
                : empresa.ativo
                  ? "Desativar"
                  : "Ativar"
            }
            aria-label={
              alterandoEstaEmpresa
                ? `Alterando status de ${empresa.nome}`
                : empresa.ativo
                  ? `Desativar ${empresa.nome}`
                  : `Ativar ${empresa.nome}`
            }
            aria-busy={alterandoEstaEmpresa}
            className={`rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              empresa.ativo
                ? "text-amber-600 hover:bg-amber-50"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            <Power size={18} />
          </button>
        )}

        {podeExcluir && (
          <button
            type="button"
            disabled={processando}
            onClick={() => void onExcluir?.(empresa)}
            title={excluindoEstaEmpresa ? "Excluindo..." : "Excluir"}
            aria-label={
              excluindoEstaEmpresa
                ? `Excluindo ${empresa.nome}`
                : `Excluir ${empresa.nome}`
            }
            aria-busy={excluindoEstaEmpresa}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    );
  }

  if (carregando) {
    return (
      <div
        role="status"
        aria-label="Carregando empresas"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
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
          Não há empresas para os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Computador */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <caption className="sr-only">Empresas encontradas</caption>

          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Empresa
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Contato
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Vínculos
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Status
              </th>

              {possuiAcoes && (
                <th
                  scope="col"
                  className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Ações
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {empresas.map((empresa) => (
              <tr key={empresa.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <p className="break-words font-medium text-slate-900">
                    {empresa.nome}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {empresa.cnpj || "CNPJ não informado"}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {empresa.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail size={15} className="shrink-0" />
                      <span className="break-all">{empresa.email}</span>
                    </p>
                  )}

                  {empresa.telefone && (
                    <p className="mt-1 flex items-center gap-1.5">
                      <Phone size={15} className="shrink-0" />
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

                {possuiAcoes && (
                  <td className="px-5 py-4">{renderizarAcoes(empresa)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular */}
      <div className="divide-y divide-slate-200 md:hidden">
        {empresas.map((empresa) => (
          <article key={empresa.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-semibold text-slate-900">
                  {empresa.nome}
                </p>

                <p className="mt-1 break-words text-sm text-slate-500">
                  {empresa.cnpj || "CNPJ não informado"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
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
                <p className="flex items-center gap-2">
                  <Mail size={15} className="shrink-0" />
                  <span className="break-all">{empresa.email}</span>
                </p>
              )}

              {empresa.telefone && (
                <p className="flex items-center gap-2">
                  <Phone size={15} className="shrink-0" />
                  {formatarTelefone(empresa.telefone)}
                </p>
              )}

              {!empresa.email && !empresa.telefone && (
                <p className="text-slate-400">Contato não informado</p>
              )}

              <p>Vínculos: {quantidadeVinculos(empresa)}</p>
            </div>

            {renderizarAcoes(empresa, true)}
          </article>
        ))}
      </div>
    </div>
  );
}
