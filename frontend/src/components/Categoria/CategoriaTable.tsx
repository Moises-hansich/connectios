import { Edit, Trash2 } from "lucide-react";

import type { Categoria } from "../../types/equipamento";

interface CategoriaTableProps {
  categorias: Categoria[];
  carregando?: boolean;
  onEditar: (categoria: Categoria) => void;
  onExcluir: (categoria: Categoria) => void;
}

export function CategoriaTable({
  categorias,
  carregando = false,
  onEditar,
  onExcluir,
}: CategoriaTableProps) {
  if (carregando) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Carregando categorias...</p>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-medium text-slate-700">
          Nenhuma categoria cadastrada.
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Clique em “Nova Categoria” para cadastrar a primeira.
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

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Descrição
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
            {categorias.map((categoria) => (
              <tr
                key={categoria.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-800">{categoria.nome}</p>
                </td>

                <td className="max-w-xs px-4 py-4 text-sm text-slate-600">
                  <p className="truncate">
                    {categoria.descricao || "Sem descrição"}
                  </p>
                </td>

                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex  px-2.5 py-1 text-xs font-semibold ${
                      categoria.ativo
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {categoria.ativo ? "Ativa" : "Inativa"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditar(categoria)}
                      className="rounded-md p-2 text-slate-800 transition hover:bg-blue-50"
                      title="Editar categoria"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onExcluir(categoria)}
                      className="rounded-md p-2 text-slate-800 hover:bg-red-50"
                      title="Excluir categoria"
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
