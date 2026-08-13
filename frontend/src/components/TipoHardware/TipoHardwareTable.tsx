import { Edit, Trash2 } from "lucide-react";

import type { TipoHardware } from "../../types/hardware";

interface TipoHardwareTableProps {
  tipos: TipoHardware[];
  carregando?: boolean;
  onEditar: (tipo: TipoHardware) => void;
  onExcluir: (tipo: TipoHardware) => void;
}

export function TipoHardwareTable({
  tipos,
  carregando = false,
  onEditar,
  onExcluir,
}: TipoHardwareTableProps) {
  if (carregando) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Carregando tipos de hardware...
        </p>
      </div>
    );
  }

  if (tipos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-medium text-slate-700">
          Nenhum tipo de hardware cadastrado.
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Clique em “Novo” para cadastrar o primeiro tipo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Nome
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ordem
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                Status
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {tipos.map((tipo) => (
              <tr key={tipo.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-800">{tipo.nome}</p>
                </td>

                <td className="px-4 py-4 text-center text-sm text-slate-600">
                  {tipo.ordem}
                </td>

                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      tipo.ativo
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tipo.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditar(tipo)}
                      className="rounded-md p-2 text-slate-800 transition hover:bg-blue-50"
                      title="Editar tipo de hardware"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onExcluir(tipo)}
                      className="rounded-md p-2 text-slate-800 hover:bg-red-50"
                      title="Excluir tipo de hardware"
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
    </div>
  );
}
