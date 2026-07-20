import { useEffect, useState } from "react";
import { buscarDashboard } from "../services/dashboardService";
import type { Equipamento } from "../types/equipamento";

type GraficoItem = {
  name: string;
  value: number;
};

type DashboardData = {
  cards: {
    total: number;
    emUso: number;
    manutencao: number;
    disponivel: number;
  };
  categorias: GraficoItem[];
  status: GraficoItem[];
  ultimos: Equipamento[];
};

const dashboardInicial: DashboardData = {
  cards: {
    total: 0,
    emUso: 0,
    manutencao: 0,
    disponivel: 0,
  },
  categorias: [],
  status: [],
  ultimos: [],
};

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData>(dashboardInicial);

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const dados = await buscarDashboard();
        setDashboard(dados);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  return {
    dashboard,
    carregando,
  };
}
