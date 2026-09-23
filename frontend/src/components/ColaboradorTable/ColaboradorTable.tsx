import { Pencil, Trash2, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import type { Colaborador } from "../../types/colaborador";
import { formatarTelefone } from "../../utils/telefone";

interface ColaboradorTableProps {
  colaboradores: Colaborador[];
  onEdit?: (colaborador: Colaborador) => void;
  onDelete?: (colaborador: Colaborador) => void;
}

export function ColaboradorTable({
  colaboradores,
  onEdit,
  onDelete,
}: ColaboradorTableProps) {
  const navigate = useNavigate();
  const { temTodasPermissoes } = useAuth();

  const podeVisualizar = temTodasPermissoes("colaboradores.visualizar");

  const podeVerEquipamentos = temTodasPermissoes(
    "colaboradores.visualizar",
    "equipamentos.visualizar",
    "hardware.visualizar",
  );

  const podeEditar =
    typeof onEdit === "function" &&
    temTodasPermissoes("colaboradores.visualizar", "colaboradores.editar");

  const podeExcluir =
    typeof onDelete === "function" &&
    temTodasPermissoes("colaboradores.visualizar", "colaboradores.excluir");

  const possuiAcoes = podeVerEquipamentos || podeEditar || podeExcluir;

  function visualizarEquipamentos(colaborador: Colaborador) {
    if (!podeVerEquipamentos) return;

    navigate(`/colaboradores/${colaborador.id}`);
  }

  function editar(colaborador: Colaborador) {
    if (!podeEditar) return;

    onEdit?.(colaborador);
  }

  function excluir(colaborador: Colaborador) {
    if (!podeExcluir) return;

    onDelete?.(colaborador);
  }

  if (!podeVisualizar) {
    return null;
  }

  if (colaboradores.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Nenhum colaborador encontrado.
      </div>
    );
  }

  return (
    <>
      {/* Cards: celular */}
      <div className="space-y-4 md:hidden">
        {colaboradores.map((colaborador) => (
          <article
            key={colaborador.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words font-semibold text-gray-900">
                  {colaborador.nome}
                </h3>

                <p className="text-sm text-gray-500">
                  {colaborador.cargo || "Cargo não informado"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  colaborador.ativo
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {colaborador.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">E-mail:</span>{" "}
                <span className="break-words text-gray-600">
                  {colaborador.email || "Não informado"}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Telefone:</span>{" "}
                <span className="text-gray-600">
                  {colaborador.telefone
                    ? formatarTelefone(colaborador.telefone)
                    : "Não informado"}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Localização:</span>{" "}
                <span className="text-gray-600">
                  {colaborador.localizacao?.nome || "Não informada"}
                </span>
              </div>

              {podeVerEquipamentos && (
                <div>
                  <span className="font-medium text-gray-700">
                    Equipamentos:
                  </span>{" "}
                  <span className="text-gray-600">
                    {colaborador.equipamentos?.length ?? 0}
                  </span>
                </div>
              )}
            </div>

            {possuiAcoes && (
              <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:justify-end">
                {podeVerEquipamentos && (
                  <button
                    type="button"
                    onClick={() => visualizarEquipamentos(colaborador)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 min-[400px]:w-auto"
                    aria-label={`Visualizar equipamentos de ${colaborador.nome}`}
                  >
                    <Monitor size={17} />
                    Visualizar
                  </button>
                )}

                {podeEditar && (
                  <button
                    type="button"
                    onClick={() => editar(colaborador)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 min-[400px]:w-auto"
                    aria-label={`Editar ${colaborador.nome}`}
                  >
                    <Pencil size={17} />
                    Editar
                  </button>
                )}

                {podeExcluir && (
                  <button
                    type="button"
                    onClick={() => excluir(colaborador)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 min-[400px]:w-auto"
                    aria-label={`Excluir ${colaborador.nome}`}
                  >
                    <Trash2 size={17} />
                    Excluir
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Tabela: computador */}
      <div className="hidden w-full overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
        <table className="w-full min-w-[900px]">
          <caption className="sr-only">Lista de colaboradores</caption>

          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th scope="col" className="px-4 py-3 font-medium">
                Nome
              </th>

              <th scope="col" className="px-4 py-3 font-medium">
                E-mail
              </th>

              <th scope="col" className="px-4 py-3 font-medium">
                Telefone
              </th>

              <th scope="col" className="px-4 py-3 font-medium">
                Cargo
              </th>

              <th scope="col" className="px-4 py-3 font-medium">
                Localização
              </th>

              <th scope="col" className="px-4 py-3 font-medium">
                Situação
              </th>

              {podeVerEquipamentos && (
                <th scope="col" className="px-4 py-3 font-medium">
                  Equipamentos
                </th>
              )}

              {possuiAcoes && (
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Ações
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {colaboradores.map((colaborador) => (
              <tr
                key={colaborador.id}
                className="text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {colaborador.nome}
                </td>

                <td className="px-4 py-3">{colaborador.email || "-"}</td>

                <td className="whitespace-nowrap px-4 py-3">
                  {colaborador.telefone
                    ? formatarTelefone(colaborador.telefone)
                    : "-"}
                </td>

                <td className="px-4 py-3">{colaborador.cargo || "-"}</td>

                <td className="px-4 py-3">
                  {colaborador.localizacao?.nome || "-"}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      colaborador.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {colaborador.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>

                {podeVerEquipamentos && (
                  <td className="px-4 py-3">
                    {colaborador.equipamentos?.length ?? 0}
                  </td>
                )}

                {possuiAcoes && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {podeVerEquipamentos && (
                        <button
                          type="button"
                          onClick={() => visualizarEquipamentos(colaborador)}
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-100 hover:text-slate-700"
                          title="Visualizar equipamentos"
                          aria-label={`Visualizar equipamentos de ${colaborador.nome}`}
                        >
                          <Monitor size={18} />
                        </button>
                      )}

                      {podeEditar && (
                        <button
                          type="button"
                          onClick={() => editar(colaborador)}
                          className="rounded-lg p-2 text-slate-800 transition-colors hover:bg-blue-100"
                          title="Editar colaborador"
                          aria-label={`Editar ${colaborador.nome}`}
                        >
                          <Pencil size={18} />
                        </button>
                      )}

                      {podeExcluir && (
                        <button
                          type="button"
                          onClick={() => excluir(colaborador)}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100"
                          title="Excluir colaborador"
                          aria-label={`Excluir ${colaborador.nome}`}
                        >
                          <Trash2 size={18} />
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
    </>
  );
}
