import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type StatusChartProps = {
  dados: {
    name: string;
    value: number;
  }[];
};

const CORES = [
  "#22c55e",
  "#eab308",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#6b7280",
];

export function StatusChart({ dados }: StatusChartProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Equipamentos por status
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Distribuição conforme a situação atual.
        </p>
      </div>

      {dados.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-gray-500">
          Nenhum status encontrado.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dados}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {dados.map((item, index) => (
                  <Cell key={item.name} fill={CORES[index % CORES.length]} />
                ))}
              </Pie>

              <Tooltip formatter={(valor) => [valor, "Quantidade"]} />

              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
