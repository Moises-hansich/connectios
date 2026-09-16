export type StatusManutencao = "EM_ANDAMENTO" | "FINALIZADA";

export type TipoManutencao = "INTERNA" | "EXTERNA";

export interface TecnicoResponsavelManutencao {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
}

export interface CategoriaEquipamentoManutencao {
  id: number;
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
}

export interface EquipamentoManutencao {
  id: number;
  nome: string;
  categoria: string | CategoriaEquipamentoManutencao;
  patrimonio: string | null;
  numeroSerie: string | null;
  status: string;
}

export interface EmpresaResponsavelManutencao {
  id: number;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
}

export interface ResponsavelManutencao {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  ativo?: boolean;
}

export interface LocalizacaoManutencao {
  id: number;
  nome: string;
  descricao?: string | null;
}

export interface UsuarioManutencao {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface MovimentacaoManutencao {
  usuario?: { id: number; nome: string } | null;
  equipamentoId?: number;
  id: number;
  tipo: string;
  statusAnterior: string | null;
  statusNovo: string | null;
  observacoes: string | null;
  dataHora: string;
}

export interface Manutencao {
  id: number;
  equipamentoId: number;
  tipo: TipoManutencao | null;
  tecnicoResponsavelId: number | null;
  tecnicoResponsavel: TecnicoResponsavelManutencao | null;
  problemaInformado: string;
  diagnostico: string | null;
  solucao: string | null;
  localManutencao: string | null;
  empresaResponsavelTexto: string | null;
  empresaResponsavelId: number | null;
  empresaResponsavel: EmpresaResponsavelManutencao | null;
  dataSaida: string;
  previsaoRetorno: string | null;
  dataRetorno: string | null;
  custo: string | number | null;
  status: StatusManutencao;
  observacoes: string | null;
  responsavelAnteriorId: number | null;
  setorAnteriorId: number | null;
  localizacaoAnteriorId: number | null;
  statusAnterior: string | null;
  registradoPorId: number | null;
  criadoEm: string;
  atualizadoEm: string;
  equipamento: EquipamentoManutencao;
  responsavelAnterior: ResponsavelManutencao | null;
  localizacaoAnterior: LocalizacaoManutencao | null;
  registradoPor: UsuarioManutencao | null;
  movimentacoes?: MovimentacaoManutencao[];
}

export interface ManutencaoFiltros {
  equipamentoId?: number;
  status?: StatusManutencao | "";
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export interface AbrirManutencaoData {
  equipamentoId: number;

  tipo?: TipoManutencao;
  tecnicoResponsavelId?: number | null;

  problemaInformado: string;
  localManutencao?: string | null;
  empresaResponsavelId?: number | null;
  previsaoRetorno?: string | null;
  custo?: number | null;
  observacoes?: string | null;
  dataSaida?: string;
}

export interface FinalizarManutencaoData {
  diagnostico?: string | null;
  solucao: string;
  custo?: number | null;
  observacoes?: string | null;
  dataRetorno?: string;
}

export interface ManutencaoResponse {
  mensagem: string;
  manutencao: Manutencao;
}

export interface ManutencoesResponse {
  manutencoes: Manutencao[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface FornecedorGarantia {
  id: number;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
}

export interface GarantiaEquipamento {
  equipamento: {
    id: number;
    nome: string;
    patrimonio: string | null;
  };

  possuiGarantia: boolean;
  garantiaAtiva: boolean;
  garantiaAte: string | null;
  diasRestantes: number | null;
  fornecedor: FornecedorGarantia | null;
}
