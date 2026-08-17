import { Edit, Layers3, Trash2 } from "lucide-react";

import type { CampoHardware } from "../../types/hardware";

interface CampoHardwareTableProps {
  campos: CampoHardware[];
  carregando?: boolean;
  onEditar: (campo: CampoHardware) => void;
  onExcluir: (campo: CampoHardware) => void;
}

interface GrupoCampoHardware {
  id: number;
  nome: string;
  campos: CampoHardware[];
}

function obterNomeTipoDado(tipoDado?: string | null): string {
  switch ((tipoDado ?? "").toLowerCase()) {
    case "texto":
      return "Texto";

    case "numero":
      return "Número";

    case "data":
      return "Data";

    case "booleano":
      return "Sim ou não";

    case "lista":
      return "Lista";

    default:
      return "Não definido";
  }
}

function obterCorTipoDado(tipoDado?: string | null): string {
  switch ((tipoDado ?? "").toLowerCase()) {
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
      return "bg-slate-200 text-slate-600";
  }
}

function agruparCampos(campos: CampoHardware[]): GrupoCampoHardware[] {
  const grupos = new Map<number, GrupoCampoHardware>();

  for (const campo of campos) {
    const tipoHardwareId = campo.tipoHardwareId;
    const nomeTipoHardware = campo.tipoHardware?.nome ?? "Tipo não informado";

    const grupoExistente = grupos.get(tipoHardwareId);

    if (grupoExistente) {
      grupoExistente.campos.push(campo);
      continue;
    }

    grupos.set(tipoHardwareId, {
      id: tipoHardwareId,
      nome: nomeTipoHardware,
      campos: [campo],
    });
  }

  return Array.from(grupos.values())
    .map((grupo) => ({
      ...grupo,
      campos: [...grupo.campos].sort(
        (campoA, campoB) =>
          campoA.ordem - campoB.ordem || campoA.nome.localeCompare(campoB.nome),
      ),
    }))
    .sort((grupoA, grupoB) => grupoA.nome.localeCompare(grupoB.nome));
}

function FormatacaoCampo({ campo }: { campo: CampoHardware }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex  px-2.5 py-1 text-xs font-semibold ${obterCorTipoDado(
          campo.tipoDado,
        )}`}
      >
        {obterNomeTipoDado(campo.tipoDado)}
      </span>

      {campo.unidade && (
        <span className="inline-flex bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {campo.unidade}
        </span>
      )}
    </div>
  );
}

export function CampoHardwareTable({
  campos,
  carregando = false,
  onEditar,
  onExcluir,
}: CampoHardwareTableProps) {
  if (carregando) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, indice) => (
          <div
            key={indice}
            className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (campos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-medium text-slate-700">
          Nenhum campo de hardware cadastrado.
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Clique em "Novo" para cadastrar o primeiro campo.
        </p>
      </div>
    );
  }

  const grupos = agruparCampos(campos);

  return (
    <div className="space-y-5">
      {grupos.map((grupo) => (
        <section
          key={grupo.id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-slate-800">
                <Layers3 size={19} />
              </div>

              <div className="min-w-0">
                <h2 className="truncate font-semibold text-slate-900">
                  {grupo.nome}
                </h2>

                <p className="text-xs text-slate-500">
                  Campos utilizados neste tipo de hardware
                </p>
              </div>
            </div>

            <span className="shrink-0  bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
              {grupo.campos.length}{" "}
              {grupo.campos.length === 1 ? "campo" : "campos"}
            </span>
          </header>

          {/* Tabela para computador */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Campo
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Formato
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Preenchimento
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ordem
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {grupo.campos.map((campo) => (
                  <tr
                    key={campo.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{campo.nome}</p>

                      {campo.placeholder && (
                        <p className="mt-1 text-xs text-slate-500">
                          Exemplo: {campo.placeholder}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <FormatacaoCampo campo={campo} />
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex  px-2.5 py-1 text-xs font-semibold ${
                          campo.obrigatorio
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {campo.obrigatorio ? "Obrigatório" : "Opcional"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center text-sm font-medium text-slate-600">
                      {campo.ordem}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditar(campo)}
                          className="rounded-lg p-2 text-slate-800 transition hover:bg-blue-50"
                          title="Editar campo"
                          aria-label={`Editar ${campo.nome}`}
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onExcluir(campo)}
                          className="rounded-lg p-2 text-slate-800 transition hover:bg-red-50"
                          title="Excluir campo"
                          aria-label={`Excluir ${campo.nome}`}
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

          {/* Cards para celular */}
          <div className="divide-y divide-slate-100 md:hidden">
            {grupo.campos.map((campo) => (
              <article key={campo.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-900">{campo.nome}</h3>

                    {campo.placeholder && (
                      <p className="mt-1 text-xs text-slate-500">
                        Exemplo: {campo.placeholder}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    Ordem {campo.ordem}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <FormatacaoCampo campo={campo} />

                  <span
                    className={`inline-flex  px-2.5 py-1 text-xs font-semibold ${
                      campo.obrigatorio
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {campo.obrigatorio ? "Obrigatório" : "Opcional"}
                  </span>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => onEditar(campo)}
                    className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-slate-800"
                  >
                    <Edit size={16} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => onExcluir(campo)}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-slate-800"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
