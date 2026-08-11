import { api } from "./api";

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

export type AtualizarEmpresaData = Partial<CriarEmpresaData>;

export const empresaService = {
  async listar(): Promise<Empresa[]> {
    const response = await api.get<Empresa[]>("/empresas");

    return response.data;
  },

  async listarAtivas(): Promise<Empresa[]> {
    const response = await api.get<Empresa[]>("/empresas");

    return response.data.filter((empresa) => empresa.ativo);
  },

  async buscarPorId(id: number): Promise<Empresa> {
    const response = await api.get<Empresa>(`/empresas/${id}`);

    return response.data;
  },

  async criar(dados: CriarEmpresaData): Promise<Empresa> {
    const response = await api.post<Empresa>("/empresas", dados);

    return response.data;
  },

  async atualizar(id: number, dados: AtualizarEmpresaData): Promise<Empresa> {
    const response = await api.put<Empresa>(`/empresas/${id}`, dados);

    return response.data;
  },
  async alterarStatus(empresa: Empresa): Promise<Empresa> {
    const response = await api.put<Empresa>(`/empresas/${empresa.id}`, {
      ativo: !empresa.ativo,
    });

    return response.data;
  },
  async excluir(id: number): Promise<void> {
    await api.delete(`/empresas/${id}`);
  },
};
