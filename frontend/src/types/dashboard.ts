import type { Equipamento } from "./equipamento";

export interface ItemGraficoDashboard {
  name: string;
  value: number;
}

export interface GarantiaDashboard {
  id: number;
  nome: string;
  patrimonio: string | null;
  numeroSerie: string | null;
  status: string;
  garantiaAte: string;
  fornecedorId: number | null;
  diasRestantes: number;

  categoria: {
    id: number;
    nome: string;
  };

  fornecedor: {
    id: number;
    nome: string;
    cnpj: string | null;
    telefone: string | null;
    email: string | null;
    ativo: boolean;
  } | null;
}

export interface DashboardData {
  cards: {
    total: number;
    emUso: number;
    manutencao: number;
    disponivel: number;
  };

  categorias: ItemGraficoDashboard[];
  status: ItemGraficoDashboard[];
  ultimos: Equipamento[];

  garantias: {
    diasAviso: number;
    total: number;
    itens: GarantiaDashboard[];
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}
