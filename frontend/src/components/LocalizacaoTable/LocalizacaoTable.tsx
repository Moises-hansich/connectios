import { Edit, MapPin, Trash2, Users } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import type { Localizacao } from "../../services/localizacaoService";

interface LocalizacaoTableProps {
  localizacoes: Localizacao[];
  carregando?: boolean;
  onEditar?: (localizacao: Localizacao) => void;
  onExcluir?: (localizacao: Localizacao) => void;
  onVerColaboradores?: (localizacao: Localizacao) => void;
}

export function LocalizacaoTable({
  localizacoes,
  carregando = false,
  onEditar,
  onExcluir,
  onVerColaboradores,
}: LocalizacaoTableProps) {
  const { temTodasPermissoes } = useAuth();

  const podeVisualizar = temTodasPermissoes("localizacoes.visualizar");

  const podeEditar =
    typeof onEditar === "function" &&
    temTodasPermissoes("localizacoes.visualizar", "localizacoes.editar");

  const podeExcluir =
    typeof onExcluir === "function" &&
    temTodasPermissoes("localizacoes.visualizar", "localizacoes.excluir");

  const podeVerColaboradores =
    typeof onVerColaboradores === "function" &&
    temTodasPermissoes(
      "localizacoes.visualizar",
      "colaboradores.visualizar",
      "equipamentos.visualizar",
      "zabbix.visualizar",
    );

  const possuiAcoes = podeEditar || podeExcluir || podeVerColaboradores;

  function editar(localizacao: Localizacao) {
    if (!podeEditar) return;

    onEditar?.(localizacao);
  }

  function excluir(localizacao: Localizacao) {
    if (!podeExcluir) return;

    onExcluir?.(localizacao);
  }

  function verColaboradores(localizacao: Localizacao) {
    if (!podeVerColaboradores) return;

    onVerColaboradores?.(localizacao);
  }

  if (!podeVisualizar) {
    return null;
  }

  if (carregando) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (localizacoes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[360px] flex-col items-center justify-center p-10 text-center">
          <div className="mb-5 rounded-full bg-blue-100 p-4 text-slate-900">
            <MapPin size={36} />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Nenhuma localização encontrada
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            Nenhuma localização corresponde à pesquisa atual.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <caption className="sr-only">Lista de localizações</caption>

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Localização
              </th>

              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Descrição
              </th>

              {possuiAcoes && (
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Ações
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {localizacoes.map((localizacao) => (
              <tr key={localizacao.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-slate-900">
                      <MapPin size={19} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {localizacao.nome}
                      </p>

                      <p className="text-xs text-slate-400">
                        Código #{localizacao.id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {localizacao.descricao || "Sem descrição"}
                </td>

                {possuiAcoes && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {podeVerColaboradores && (
                        <button
                          type="button"
                          onClick={() => verColaboradores(localizacao)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                          title="Ver colaboradores"
                          aria-label={`Ver colaboradores de ${localizacao.nome}`}
                        >
                          <Users size={18} />
                        </button>
                      )}

                      {podeEditar && (
                        <button
                          type="button"
                          onClick={() => editar(localizacao)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-slate-900"
                          title="Editar localização"
                          aria-label={`Editar ${localizacao.nome}`}
                        >
                          <Edit size={17} />
                        </button>
                      )}

                      {podeExcluir && (
                        <button
                          type="button"
                          onClick={() => excluir(localizacao)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Excluir localização"
                          aria-label={`Excluir ${localizacao.nome}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
