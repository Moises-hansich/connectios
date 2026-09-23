import { api } from "./api";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface TecnicoOption {
  id: number;
  nome: string;
}

export interface CriarUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  perfil: string;
}

export interface AtualizarUsuarioDTO {
  nome?: string;
  email?: string;
  senha?: string;
  perfil?: string;
  ativo?: boolean;
}

interface RespostaApi<T> {
  sucesso: boolean;
  data: T;
}

export const usuarioService = {
  async listarTecnicos(): Promise<TecnicoOption[]> {
    const response =
      await api.get<RespostaApi<TecnicoOption[]>>("/usuarios/tecnicos");

    return response.data.data;
  },

  async listar(): Promise<Usuario[]> {
    const response = await api.get<RespostaApi<Usuario[]>>("/usuarios");

    return response.data.data;
  },

  async buscar(id: number): Promise<Usuario> {
    const response = await api.get<RespostaApi<Usuario>>(`/usuarios/${id}`);

    return response.data.data;
  },

  async criar(dados: CriarUsuarioDTO): Promise<Usuario> {
    const response = await api.post<RespostaApi<Usuario>>("/usuarios", dados);

    return response.data.data;
  },

  async atualizar(id: number, dados: AtualizarUsuarioDTO): Promise<Usuario> {
    const response = await api.put<RespostaApi<Usuario>>(
      `/usuarios/${id}`,
      dados,
    );

    return response.data.data;
  },

  async alterarStatus(id: number, ativo: boolean): Promise<Usuario> {
    const response = await api.patch<RespostaApi<Usuario>>(
      `/usuarios/${id}/status`,
      { ativo },
    );

    return response.data.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};
