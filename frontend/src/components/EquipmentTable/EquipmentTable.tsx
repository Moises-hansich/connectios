import type { Equipamento } from "../../types/equipamento";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "../Badge/Badge";

interface EquipmentTableProps {
  equipamentos: Equipamento[];
  onEdit: (equipamento: Equipamento) => void;
}

export function EquipmentTable({ equipamentos, onEdit }: EquipmentTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-slate-200 text-left">
          <th className="p-3">Nome</th>
          <th className="p-3">Categoria</th>
          <th className="p-3">Fabricante</th>
          <th className="p-3">Status</th>
          <th className="p-3">Localização</th>
          <th className="p-3">Ações</th>
        </tr>
      </thead>

      <tbody>
        {equipamentos.map((equipamento) => (
          <tr key={equipamento.id} className="bord border-slate-100">
            <td className="p-3">{equipamento.nome}</td>
            <td className="p-3">{equipamento.categoria}</td>
            <td className="p-3">{equipamento.fabricante ?? "-"}</td>
            <td className="p-3">
              <Badge status={equipamento.status} />
            </td>
            <td className="p-3">{equipamento.localizacao ?? "-"}</td>
            <td className="p-3">
              <div className="flex justify-center gap-2">
                <button
                  className="rounded p-2 text-blue-600 hover:bg-blue-100"
                  onClick={() => onEdit(equipamento)}
                >
                  <Pencil size={18} />
                </button>

                <button className="rounded p-2 text-gray-600 transition hover:bg-red-300">
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
