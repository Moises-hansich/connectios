import { Pencil, Trash2 } from "lucide-react";

import type { Colaborador } from "../../types/colaborador";

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
                <h3 className="truncate font-semibold text-gray-900">
                  {colaborador.nome}
                </h3>

                <p className="text-sm text-gray-500">
                  {colaborador.cargo || "Cargo não informado"}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
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
                <span className="text-gray-600">
                  {colaborador.email || "Não informado"}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Telefone:</span>{" "}
                <span className="text-gray-600">
                  {colaborador.telefone || "Não informado"}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Localização:</span>{" "}
                <span className="text-gray-600">
                  {colaborador.localizacao?.nome || "Não informada"}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Equipamentos:</span>{" "}
                <span className="text-gray-600">
                  {colaborador.equipamentos.length}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 min-[400px]:flex-row min-[400px]:justify-end">
              <button
                type="button"
                onClick={() => onEdit?.(colaborador)}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 min-[400px]:w-auto"
              >
                <Pencil size={17} />
                Editar
              </button>

              <button
                type="button"
                onClick={() => onDelete?.(colaborador)}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-50 min-[400px]:w-auto"
              >
                <Trash2 size={17} />
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Tabela: computador */}
      <div className="hidden w-full overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Cargo</th>
              <th className="px-4 py-3 font-medium">Localização</th>
              <th className="px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3 font-medium">Equipamentos</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
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

                <td className="px-4 py-3">{colaborador.telefone || "-"}</td>

                <td className="px-4 py-3">{colaborador.cargo || "-"}</td>

                <td className="px-4 py-3">
                  {colaborador.localizacao?.nome || "-"}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      colaborador.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {colaborador.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td className="px-4 py-3">{colaborador.equipamentos.length}</td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit?.(colaborador)}
                      className="p-2 text-slate-800 transition-colors hover:bg-blue-200"
                      aria-label={`Editar ${colaborador.nome}`}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete?.(colaborador)}
                      className="p-2 text-slate-800 transition-colors hover:bg-red-200"
                      aria-label={`Excluir ${colaborador.nome}`}
                    >
                      <Trash2 size={18} />
                    </button>
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
