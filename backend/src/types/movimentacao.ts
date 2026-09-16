export const TIPOS_MOVIMENTACAO = [
  "ENTREGA",
  "TROCA",
  "DEVOLUCAO",
  "MUDANCA_SETOR",
  "MUDANCA_LOCALIZACAO",
  "ENTRADA_MANUTENCAO",
  "RETORNO_MANUTENCAO",
  "BAIXA",
  "INSTALACAO_PECA",
  "RETIRADA_PECA",
] as const;

export type TipoMovimentacao = (typeof TIPOS_MOVIMENTACAO)[number];

export interface EquipamentoMovimentacao {
  id: number;
  nome: string;
  categoria: string;
  fabricante: string | null;
  modelo: string | null;
  patrimonio: string | null;
  numeroSerie: string | null;
  status: string;
}

export interface ColaboradorMovimentacao {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  ativo: boolean;
  setorId: number | null;
  localizacaoId: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface SetorMovimentacao {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LocalizacaoMovimentacao {
  id: number;
  nome: string;
  descricao: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ManutencaoMovimentacao {
  id: number;
  problemaInformado: string;
  diagnostico: string | null;
  solucao: string | null;
  status: string;
  dataSaida: string;
  dataRetorno: string | null;
}

export interface UsuarioMovimentacao {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface Movimentacao {
  id: number;
  tipo: TipoMovimentacao;

  equipamentoId: number;
  equipamento: EquipamentoMovimentacao;

  equipamentoRelacionadoId: number | null;
  equipamentoRelacionado: EquipamentoMovimentacao | null;

  responsavelAnteriorId: number | null;
  responsavelAnterior: ColaboradorMovimentacao | null;

  responsavelNovoId: number | null;
  responsavelNovo: ColaboradorMovimentacao | null;

  setorAnteriorId: number | null;
  setorAnterior: SetorMovimentacao | null;

  setorNovoId: number | null;
  setorNovo: SetorMovimentacao | null;

  localizacaoAnteriorId: number | null;
  localizacaoAnterior: LocalizacaoMovimentacao | null;

  localizacaoNovaId: number | null;
  localizacaoNova: LocalizacaoMovimentacao | null;

  manutencaoId: number | null;
  manutencao: ManutencaoMovimentacao | null;

  usuarioId: number | null;
  usuario: UsuarioMovimentacao | null;

  statusAnterior: string | null;
  statusNovo: string | null;
  observacoes: string | null;

  dataHora: string;
  criadoEm: string;
}

export interface MovimentacoesResponse {
  movimentacoes: Movimentacao[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MovimentacaoFilters {
  equipamentoId?: number;
  tipo?: TipoMovimentacao;
  usuarioId?: number;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}
