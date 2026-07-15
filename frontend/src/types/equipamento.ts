export interface Equipamento {
  id: number;
  nome: string;
  categoria: string;
  fabricante: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  patrimonio: string | null;
  status: string;
  localizacao: string | null;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
}
export interface EquipamentosResponse {
  success: boolean;
  data: Equipamento[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
