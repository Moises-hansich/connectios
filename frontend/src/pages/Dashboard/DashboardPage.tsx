import { Computer, Monitor, Package, Wrench } from "lucide-react";

import { MainLayout } from "../../layouts/MainLayout";
import { StatsCard } from "../../components/Dashboard/StatsCard";
import { CategoryChart } from "../../components/Dashboard/CategoryChart";
import { StatusChart } from "../../components/Dashboard/StatusChart";
import { RecentEquipments } from "../../components/Dashboard/RecentEquipments";
import { AlertsCard } from "../../components/Dashboard/AlertsCard";
import { useDashboard } from "../../hooks/useDashboard";

export function DashboardPage() {
  const { dashboard, carregando } = useDashboard();

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

        <p className="mt-1 text-gray-500">
          Visão geral dos equipamentos cadastrados.
        </p>
      </div>

      {carregando ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          Carregando dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              titulo="Total"
              valor={dashboard.cards.total}
              icone={<Package size={28} />}
              cor="bg-blue-500"
            />

            <StatsCard
              titulo="Em uso"
              valor={dashboard.cards.emUso}
              icone={<Computer size={28} />}
              cor="bg-green-500"
            />

            <StatsCard
              titulo="Disponíveis"
              valor={dashboard.cards.disponivel}
              icone={<Monitor size={28} />}
              cor="bg-indigo-500"
            />

            <StatsCard
              titulo="Manutenção"
              valor={dashboard.cards.manutencao}
              icone={<Wrench size={28} />}
              cor="bg-yellow-500"
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <CategoryChart dados={dashboard.categorias} />
            <StatusChart dados={dashboard.status} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <RecentEquipments equipamentos={dashboard.ultimos} />

            <AlertsCard
              manutencao={dashboard.cards.manutencao}
              disponiveis={dashboard.cards.disponivel}
            />
          </div>
        </>
      )}
    </MainLayout>
  );
}
