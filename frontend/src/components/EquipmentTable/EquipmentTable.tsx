import type { Equipamento } from "../../types/equipamento";

interface EquipmentTableProps {
  equipamentos: Equipamento[];
}

export function EquipmentTable({ equipamentos }: EquipmentTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-slate-200 text-left">
          <th className="p-3">Nome</th>
          <th className="p-3">Categoria</th>
          <th className="p-3">Fabricante</th>
          <th className="p-3">Status</th>
          <th className="p-3">Localização</th>
        </tr>
      </thead>

      <tbody>
        {equipamentos.map((equipamento) => (
          <tr key={equipamento.id} className="bord border-slate-100">
            <td className="p-3">{equipamento.nome}</td>
            <td className="p-3">{equipamento.categoria}</td>
            <td className="p-3">{equipamento.fabricante ?? "-"}</td>
            <td className="p-3">{equipamento.status}</td>
            <td className="p-3">{equipamento.localizacao ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
