export interface Localizacao {
  id: number;
  nome: string;
  descricao: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface TipoHardware {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CampoHardware {
  id: number;
  nome: string;
  chave: string;
  tipoDado: string;
  unidade: string | null;
  placeholder: string | null;
  obrigatorio: boolean;
  ativo: boolean;
  ordem: number;
  tipoHardwareId: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ValorHardware {
  id: number;
  valor: string;
  hardwareId: number;
  campoHardwareId: number;
  criadoEm: string;
  atualizadoEm: string;
  campoHardware: CampoHardware;
}

export interface Hardware {
  id: number;
  nome: string;
  fabricante: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  observacoes: string | null;
  tipoHardwareId: number;
  equipamentoId: number;
  criadoEm: string;
  atualizadoEm: string;
  tipoHardware: TipoHardware;
  valores: ValorHardware[];
}

export interface EquipamentoColaborador {
  id: number;
  nome: string;
  categoria: string;
  fabricante: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  patrimonio: string | null;
  status: string;
  observacoes: string | null;
  localizacaoId: number | null;
  responsavelId: number | null;
  criadoEm: string;
  atualizadoEm: string;
  localizacao: Localizacao | null;
  hardware: Hardware[];
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
}

export interface ColaboradorCompleto extends Colaborador {
  equipamentos: EquipamentoColaborador[];
}

export interface Paginacao {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Resposta de GET /api/colaboradores
export interface ColaboradorResponse {
  success: boolean;
  data: Colaborador[];
  pagination: Paginacao;
}

// Resposta de GET /api/colaboradores/:id
export interface ColaboradorPorIdResponse {
  success: boolean;
  data: Colaborador;
}

// Resposta de GET /api/colaboradores/:id/completo
export interface ColaboradorCompletoResponse {
  success: boolean;
  data: ColaboradorCompleto;
}

export interface ColaboradorCreateData {
  nome: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  localizacaoId?: number | null;
  ativo?: boolean;
}

export type ColaboradorUpdateData = Partial<ColaboradorCreateData>;
