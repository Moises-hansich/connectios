import { useState } from "react";
import { Cpu, Image as ImageIcon, Pencil, Trash2, Wrench } from "lucide-react";

import { Badge } from "../Badge";
import { api } from "../../services/api";
import type { Equipamento } from "../../types/equipamento";

function obterOrigemBackend() {
  const baseURL = api.defaults.baseURL;

  if (baseURL && /^https?:\/\//i.test(baseURL)) {
    return new URL(baseURL).origin;
  }

  return `${window.location.protocol}//${window.location.hostname}:3000`;
}

function obterUrlFoto(nomeArquivo: string) {
  return `${obterOrigemBackend()}/uploads/equipamentos/${encodeURIComponent(
    nomeArquivo,
  )}`;
}

interface MiniaturaEquipamentoProps {
  equipamento: Equipamento;
  className: string;
}

function MiniaturaEquipamento({
  equipamento,
  className,
}: MiniaturaEquipamentoProps) {
  const [erroAoCarregar, setErroAoCarregar] = useState(false);
  const fotoPrincipal = equipamento.fotos?.[0];

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 text-gray-400 ${className}`}
    >
      {fotoPrincipal && !erroAoCarregar ? (
        <img
          src={obterUrlFoto(fotoPrincipal.nomeArquivo)}
          alt={`Foto de ${equipamento.nome}`}
          title={fotoPrincipal.nomeOriginal}
          loading="lazy"
          onError={() => setErroAoCarregar(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageIcon size={24} aria-label="Equipamento sem foto" />
      )}
    </div>
  );
}

interface EquipmentTableProps {
  equipamentos: Equipamento[];

  onEdit?: (equipamento: Equipamento) => void;

  onDelete?: (equipamento: Equipamento) => void;

  onHardware?: (equipamento: Equipamento) => void;

  onMaintenance?: (equipamento: Equipamento) => void;
}

export function EquipmentTable({
  equipamentos,
  onEdit,
  onDelete,
  onHardware,
  onMaintenance,
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
      {/* Cards exibidos no celular */}
      <div className="space-y-4 md:hidden">
        {equipamentos.map((equipamento) => (
          <article
            key={equipamento.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <MiniaturaEquipamento
                key={equipamento.fotos?.[0]?.id ?? "sem-foto"}
                equipamento={equipamento}
                className="h-20 w-20"
              />

              <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-gray-900">
                    {equipamento.nome}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {equipamento.categoria?.nome ?? "Sem categoria"}
                  </p>
                </div>

                <Badge status={equipamento.status} />
              </div>
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
                <span className="font-medium text-gray-700">Responsável:</span>{" "}
                <span className="text-gray-600">
                  {equipamento.responsavel?.nome || "Sem responsável"}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Localização:</span>{" "}
                <span className="text-gray-600">
                  {equipamento.localizacao?.nome || "Não informada"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 sm:flex sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={() => onHardware?.(equipamento)}
                className="flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Cpu size={17} className="shrink-0" />
                <span>Hardware</span>
              </button>

              <button
                type="button"
                onClick={() => onMaintenance?.(equipamento)}
                className="flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
              >
                <Wrench size={17} className="shrink-0" />
                <span>Manutenção</span>
              </button>

              <button
                type="button"
                onClick={() => onEdit?.(equipamento)}
                className="flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <Pencil size={17} className="shrink-0" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={() => onDelete?.(equipamento)}
                className="flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={17} className="shrink-0" />
                <span>Excluir</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Tabela exibida no computador */}
      <div className="hidden w-full overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
        <table className="w-full min-w-[1150px]">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Fabricante</th>
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 font-medium">Patrimônio</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
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
                <td className="px-4 py-3">
                  <MiniaturaEquipamento
                    key={equipamento.fotos?.[0]?.id ?? "sem-foto"}
                    equipamento={equipamento}
                    className="h-14 w-14"
                  />
                </td>

                <td className="px-4 py-3 font-medium text-gray-900">
                  {equipamento.nome}
                </td>

                <td className="px-4 py-3">
                  {equipamento.categoria?.nome ?? "Sem categoria"}
                </td>

                <td className="px-4 py-3">{equipamento.fabricante || "-"}</td>

                <td className="px-4 py-3">{equipamento.modelo || "-"}</td>

                <td className="px-4 py-3">{equipamento.patrimonio || "-"}</td>

                <td className="px-4 py-3">
                  {equipamento.responsavel?.nome || "Sem responsável"}
                </td>

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
                      onClick={() => onHardware?.(equipamento)}
                      className="rounded-lg p-2 text-slate-800 transition-colors hover:bg-indigo-200"
                      aria-label={`Hardware ${equipamento.nome}`}
                      title="Visualizar hardware"
                    >
                      <Cpu size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onMaintenance?.(equipamento)}
                      className="rounded-lg p-2 text-slate-800 transition-colors hover:bg-amber-200"
                      aria-label={`Enviar ${equipamento.nome} para manutenção`}
                      title="Enviar para manutenção"
                    >
                      <Wrench size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit?.(equipamento)}
                      className="rounded-lg p-2 text-slate-800 transition-colors hover:bg-blue-200"
                      aria-label={`Editar ${equipamento.nome}`}
                      title="Editar equipamento"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete?.(equipamento)}
                      className="rounded-lg p-2 text-slate-800 transition-colors hover:bg-red-200"
                      aria-label={`Excluir ${equipamento.nome}`}
                      title="Excluir equipamento"
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
