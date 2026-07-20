import type { Equipamento } from "../../types/equipamento";

type Props = {
  equipamentos: Equipamento[];
};

export function RecentEquipments({ equipamentos }: Props) {
  const recentes = [...equipamentos]
    .sort(
      (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Últimos equipamentos cadastrados
      </h2>

      {recentes.length === 0 ? (
        <p className="text-gray-400">Nenhum equipamento cadastrado.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Nome</th>
              <th className="py-2 text-left">Categoria</th>
              <th className="py-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {recentes.map((equipamento) => (
              <tr key={equipamento.id} className="border-b last:border-0">
                <td className="py-3">{equipamento.nome}</td>

                <td>{equipamento.categoria}</td>

                <td>{equipamento.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
