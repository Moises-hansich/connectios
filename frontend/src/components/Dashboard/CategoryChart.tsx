import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CategoryChartProps = {
  dados: {
    name: string;
    value: number;
  }[];
};

export function CategoryChart({ dados }: CategoryChartProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Equipamentos por categoria
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Quantidade cadastrada em cada categoria.
        </p>
      </div>

      {dados.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-gray-500">
          Nenhum equipamento encontrado.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dados}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />

              <XAxis type="number" allowDecimals={false} />

              <YAxis type="category" dataKey="name" width={110} />

              <Tooltip />

              <Bar
                dataKey="value"
                name="Quantidade"
                fill="#3b82f6"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
