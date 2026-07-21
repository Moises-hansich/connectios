import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "../Badge";
import type { Equipamento } from "../../types/equipamento";

interface EquipmentTableProps {
  equipamentos: Equipamento[];
  onEdit?: (equipamento: Equipamento) => void;
  onDelete?: (equipamento: Equipamento) => void;
}

export function EquipmentTable({
  equipamentos,
  onEdit,
  onDelete,
}: EquipmentTableProps) {
  if (equipamentos.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Nenhum equipamento encontrado.
      </div>
    );
  }

  return (
    <>
      {/* Cards: celular */}
      <div className="space-y-4 md:hidden">
        {equipamentos.map((equipamento) => (
          <article
            key={equipamento.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-gray-900">
                  {equipamento.nome}
                </h3>

                <p className="text-sm text-gray-500">{equipamento.categoria}</p>
              </div>

              <Badge status={equipamento.status} />
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Fabricante:</span>{" "}
                <span className="text-gray-600">
                  {equipamento.fabricante || "Não informado"}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Modelo:</span>{" "}
                <span className="text-gray-600">
                  {equipamento.modelo || "Não informado"}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Patrimônio:</span>{" "}
                <span className="text-gray-600">
                  {equipamento.patrimonio || "Não informado"}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Localização:</span>{" "}
                <span className="text-gray-600">
                  {equipamento.localizacao?.nome || "Não informada"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 min-[400px]:flex-row min-[400px]:justify-end">
              <button
                type="button"
                onClick={() => onEdit?.(equipamento)}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 min-[400px]:w-auto"
              >
                <Pencil size={17} />
                Editar
              </button>

              <button
                type="button"
                onClick={() => onDelete?.(equipamento)}
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
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Fabricante</th>
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 font-medium">Patrimônio</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Localização</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {equipamentos.map((equipamento) => (
              <tr
                key={equipamento.id}
                className="text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {equipamento.nome}
                </td>

                <td className="px-4 py-3">{equipamento.categoria}</td>

                <td className="px-4 py-3">{equipamento.fabricante || "-"}</td>

                <td className="px-4 py-3">{equipamento.modelo || "-"}</td>

                <td className="px-4 py-3">{equipamento.patrimonio || "-"}</td>

                <td className="px-4 py-3">
                  <Badge status={equipamento.status} />
                </td>

                <td className="px-4 py-3">
                  {equipamento.localizacao?.nome || "-"}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit?.(equipamento)}
                      className="p-2 text-slate-800 transition-colors hover:bg-blue-200"
                      aria-label={`Editar ${equipamento.nome}`}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete?.(equipamento)}
                      className="p-2 text-slate-800 transition-colors hover:bg-red-200"
                      aria-label={`Excluir ${equipamento.nome}`}
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
