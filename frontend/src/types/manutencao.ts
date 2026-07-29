export type StatusManutencao = "EM_ANDAMENTO" | "FINALIZADA";

export interface EquipamentoManutencao {
  id: number;
  nome: string;
  categoria: string;
  patrimonio: string | null;
  numeroSerie: string | null;
  status: string;
}

export interface ResponsavelManutencao {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  ativo: boolean;
  localizacaoId: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LocalizacaoManutencao {
  id: number;
  nome: string;
  descricao: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UsuarioManutencao {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface MovimentacaoManutencao {
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
  problemaInformado: string;
  diagnostico: string | null;
  solucao: string | null;
  localManutencao: string | null;
  empresaResponsavel: string | null;
  dataSaida: string;
  previsaoRetorno: string | null;
  dataRetorno: string | null;
  custo: string | null;
  status: StatusManutencao;
  observacoes: string | null;
  responsavelAnteriorId: number | null;
  localizacaoAnteriorId: number | null;
  statusAnterior: string;
  registradoPorId: number | null;
  criadoEm: string;
  atualizadoEm: string;

  equipamento: EquipamentoManutencao;
  responsavelAnterior: ResponsavelManutencao | null;
  localizacaoAnterior: LocalizacaoManutencao | null;
  registradoPor: UsuarioManutencao | null;
  movimentacoes: MovimentacaoManutencao[];
}

export interface ManutencoesResponse {
  manutencoes: Manutencao[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ManutencaoResponse {
  mensagem: string;
  manutencao: Manutencao;
}

export interface ManutencaoFiltros {
  equipamentoId?: number;
  status?: StatusManutencao;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export interface AbrirManutencaoData {
  equipamentoId: number;
  problemaInformado: string;
  localManutencao?: string | null;
  empresaResponsavel?: string | null;
  previsaoRetorno?: string | null;
  custo?: number | null;
  observacoes?: string | null;
  registradoPorId?: number | null;
  dataSaida?: string;
}

export interface FinalizarManutencaoData {
  diagnostico?: string | null;
  solucao: string;
  custo?: number | null;
  observacoes?: string | null;
  usuarioId?: number | null;
  dataRetorno?: string;
}
