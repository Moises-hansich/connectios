import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { dashboardService } from "../services/dashboardService";

import type { DashboardData } from "../types/dashboard";

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

  garantias: {
    diasAviso: 30,
    total: 0,
    itens: [],
  },
};

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData>(dashboardInicial);

  const [carregando, setCarregando] = useState(true);

  const carregarDashboard = useCallback(async () => {
    try {
      setCarregando(true);

      const dados = await dashboardService.buscar();

      setDashboard(dados);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);

      toast.error("Não foi possível carregar o dashboard.");

      setDashboard(dashboardInicial);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarDashboard();
  }, [carregarDashboard]);

  return {
    dashboard,
    carregando,
    carregarDashboard,
  };
}
