import { Edit, Trash2 } from "lucide-react";

import type { CampoHardware } from "../../types/hardware";

interface CampoHardwareTableProps {
  campos: CampoHardware[];
  carregando?: boolean;
  onEditar: (campo: CampoHardware) => void;
  onExcluir: (campo: CampoHardware) => void;
}

function getTipoBadge(tipo?: string | null) {
  switch ((tipo ?? "").toLowerCase()) {
    case "texto":
      return "bg-sky-100 text-sky-700";

    case "numero":
      return "bg-violet-100 text-violet-700";

    case "data":
      return "bg-amber-100 text-amber-700";

    case "booleano":
      return "bg-emerald-100 text-emerald-700";

    case "lista":
      return "bg-indigo-100 text-indigo-700";

    default:
      return "bg-slate-200 text-slate-700";
  }
}

export function CampoHardwareTable({
  campos,
  carregando = false,
  onEditar,
  onExcluir,
}: CampoHardwareTableProps) {
  if (carregando) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Carregando campos de hardware...
        </p>
      </div>
    );
  }

  if (campos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-medium text-slate-700">
          Nenhum campo de hardware cadastrado.
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Clique em "Novo" para cadastrar o primeiro campo.
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
                Tipo
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                Obrigatório
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Tipo de Hardware
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ordem
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {campos.map((campo) => (
              <tr
                key={campo.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-slate-800">{campo.nome}</p>

                    {campo.descricao && (
                      <p className="mt-1 text-sm text-slate-500">
                        {campo.descricao}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getTipoBadge(
                      campo.tipo,
                    )}`}
                  >
                    {campo.tipo}
                  </span>
                </td>

                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      campo.obrigatorio
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {campo.obrigatorio ? "Sim" : "Não"}
                  </span>
                </td>

                <td className="px-4 py-4">{campo.tipoHardware?.nome ?? "-"}</td>

                <td className="px-4 py-4 text-center">{campo.ordem}</td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditar(campo)}
                      className="rounded-md p-2 text-blue-600 transition hover:bg-blue-50"
                      title="Editar campo"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onExcluir(campo)}
                      className="rounded-md p-2 text-red-600 transition hover:bg-red-50"
                      title="Excluir campo"
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
