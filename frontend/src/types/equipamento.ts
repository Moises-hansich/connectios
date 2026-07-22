export interface Localizacao {
  id: number;
  nome: string;
  descricao: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Responsavel {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  cargo: string | null;
  localizacaoId: number | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Equipamento {
  id: number;
  nome: string;
  categoria: string;
  fabricante: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  patrimonio: string | null;
  status: string;

  localizacaoId: number | null;
  localizacao: Localizacao | null;

  responsavelId: number | null;
  responsavel: Responsavel | null;

  observacoes: string | null;

  criadoEm: string;
  atualizadoEm: string;
}

export interface EquipamentosResponse {
  success: boolean;
  data: Equipamento[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CriarEquipamentoData {
  nome: string;
  categoria: string;
  fabricante?: string;
  modelo?: string;
  numeroSerie?: string;
  patrimonio?: string;
  status: string;

  localizacaoId?: number | null;
  responsavelId?: number | null;

  observacoes?: string;
}

export interface AtualizarEquipamentoData {
  nome?: string;
  categoria?: string;
  fabricante?: string;
  modelo?: string;
  numeroSerie?: string;
  patrimonio?: string;
  status?: string;

  localizacaoId?: number | null;
  responsavelId?: number | null;

  observacoes?: string;
}
