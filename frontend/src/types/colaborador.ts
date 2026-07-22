export interface Localizacao {
  id: number;
  nome: string;
  descricao: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Colaborador {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  localizacaoId: number | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;

  localizacao: Localizacao | null;

  equipamentos: [];
}

export interface ColaboradorResponse {
  success: boolean;
  data: Colaborador[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ColaboradorCreateData {
  nome: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  localizacaoId?: number | null;
  ativo?: boolean;
}
