export interface Empresa {
  id: number;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  observacoes: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;

  _count?: {
    equipamentosFornecidos: number;
    manutencoesRealizadas: number;
  };
}
export interface CriarEmpresaData {
  nome: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  ativo?: boolean;
}
