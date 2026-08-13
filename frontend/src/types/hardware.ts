export interface TipoHardware {
  id: number;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
  ordem: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CampoHardware {
  id: number;
  nome: string;
  chave: string;
  tipoDado: string;
  unidade?: string | null;
  placeholder?: string | null;
  obrigatorio: boolean;
  ativo: boolean;
  ordem: number;
  tipoHardwareId: number;
  criadoEm?: string;
  atualizadoEm?: string;
  tipoHardware?: TipoHardware;
}

export interface HardwareValor {
  id: number;
  valor: string;
  hardwareId: number;
  campoHardwareId: number;
  criadoEm?: string;
  atualizadoEm?: string;
  campoHardware: CampoHardware;
}

export interface Hardware {
  id: number;
  nome: string;
  fabricante?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  observacoes?: string | null;
  equipamentoId: number;
  tipoHardwareId: number;
  criadoEm?: string;
  atualizadoEm?: string;
  tipoHardware: TipoHardware;
  valores: HardwareValor[];
}

export interface CriarHardwareData {
  nome: string;
  fabricante?: string;
  modelo?: string;
  numeroSerie?: string;
  observacoes?: string;
  equipamentoId: number;
  tipoHardwareId: number;
}

export type AtualizarHardwareData = Partial<CriarHardwareData>;

export interface CriarHardwareValorData {
  valor: string;
  hardwareId: number;
  campoHardwareId: number;
}

export type AtualizarHardwareValorData = Partial<CriarHardwareValorData>;

export interface CriarTipoHardwareData {
  nome: string;
  descricao?: string;
  ordem?: number;
}

export type AtualizarTipoHardwareData = Partial<CriarTipoHardwareData>;

export interface CriarCampoHardwareData {
  nome: string;
  chave: string;
  tipoDado: string;
  unidade?: string | null;
  placeholder?: string | null;
  obrigatorio?: boolean;
  ativo?: boolean;
  ordem?: number;
  tipoHardwareId: number;
}

export type AtualizarCampoHardwareData = Partial<CriarCampoHardwareData>;
