import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

type StatsCardProps = {
  titulo: string;
  valor: number;
  icone: ReactNode;
  cor?: string;
};

export function StatsCard({
  titulo,
  valor,
  icone,
  cor = "bg-blue-500",
}: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{titulo}</p>

          <h2 className="mt-3 text-4xl font-bold text-gray-800">{valor}</h2>

          <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
            <TrendingUp size={14} />
            Dados atualizados
          </div>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl text-white ${cor}`}
        >
          {icone}
        </div>
      </div>
    </div>
  );
}
