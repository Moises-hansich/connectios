import type { Hardware } from "./hardware";

export type { Hardware } from "./hardware";
export interface Categoria {
  id: number;
  nome: string;
  grupo: "COMPUTADORES" | "PERIFERICOS" | "PECAS" | "OUTROS";
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Localizacao {
  id: number;
  nome: string;
  descricao: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Setor {
  id: number;
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
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

export interface FotoEquipamentoResumo {
  id: number;
  nomeArquivo: string;
  nomeOriginal: string;
  principal: boolean;
}
export interface EmpresaFornecedor {
  id: number;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}
export interface Equipamento {
  instaladoEmId?: number | null;
  id: number;
  nome: string;
  zabbixHostId: string | null;
  categoriaId: number;
  categoria: Categoria;

  fabricante: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  patrimonio: string | null;
  status: string;

  dataCompra: string | null;
  garantiaAte: string | null;

  setorId: number | null;
  setor?: Setor | null;

  localizacaoId: number | null;
  localizacao: Localizacao | null;

  responsavelId: number | null;
  responsavel: Responsavel | null;

  fornecedorId: number | null;
  fornecedor: EmpresaFornecedor | null;

  observacoes: string | null;

  hardware?: Hardware[];
  fotos?: FotoEquipamentoResumo[];

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
  categoriaId: number;
  fabricante?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  patrimonio?: string | null;
  zabbixHostId: string | null;
  status: string;
  setorId?: number | null;
  localizacaoId?: number | null;
  responsavelId?: number | null;
  fornecedorId?: number | null;
  dataCompra?: string | null;
  garantiaAte?: string | null;
  observacoes?: string | null;
}

export type AtualizarEquipamentoData = Partial<CriarEquipamentoData>;
