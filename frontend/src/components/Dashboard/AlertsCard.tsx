import { AlertTriangle } from "lucide-react";

type AlertsCardProps = {
  manutencao: number;
  disponiveis: number;
};

export function AlertsCard({ manutencao, disponiveis }: AlertsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <AlertTriangle className="text-yellow-500" size={22} />

        <h2 className="text-lg font-semibold text-gray-800">Alertas</h2>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="font-medium text-gray-700">
            Equipamentos em manutenção
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-700">
            {manutencao}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <p className="font-medium text-gray-700">Equipamentos disponíveis</p>

          <p className="mt-1 text-2xl font-bold text-green-700">
            {disponiveis}
          </p>
        </div>
      </div>
    </div>
  );
}
