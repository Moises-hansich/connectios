import { Computer, Monitor, Package, Wrench } from "lucide-react";

import { MainLayout } from "../../layouts/MainLayout";
import { StatsCard } from "../../pages/Dashboard/StatsCard";
import { CategoryChart } from "../../pages/Dashboard/CategoryChart";
import { useDashboard } from "../../hooks/useDashboard";

export function DashboardPage() {
  const { estatisticas, categorias, carregando } = useDashboard();

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

        <p className="mt-1 text-gray-500">
          Visão geral dos equipamentos cadastrados.
        </p>
      </div>

      {carregando ? (
        <div className="rounded-xl border bg-white p-6">
          Carregando dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              titulo="Total"
              valor={estatisticas.total}
              icone={<Package size={28} />}
              cor="bg-blue-500"
            />

            <StatsCard
              titulo="Em uso"
              valor={estatisticas.emUso}
              icone={<Computer size={28} />}
              cor="bg-green-500"
            />

            <StatsCard
              titulo="Disponíveis"
              valor={estatisticas.disponivel}
              icone={<Monitor size={28} />}
              cor="bg-indigo-500"
            />

            <StatsCard
              titulo="Manutenção"
              valor={estatisticas.manutencao}
              icone={<Wrench size={28} />}
              cor="bg-yellow-500"
            />
          </div>

          <div className="mt-6">
            <CategoryChart dados={categorias} />
          </div>
        </>
      )}
    </MainLayout>
  );
}
